// utils/generateTikTokSign.js
import crypto from "crypto";

/**
 * generateTikTokSign - tạo sign theo doc TikTok Shop Open/Partner API
 * - NOTE: nếu body === {} (rỗng) vẫn phải include JSON.stringify(body) vào chuỗi ký cho 1 số POST endpoint (vd orders/search)
 */
export function generateTikTokSign({
  appSecret,
  path,
  params = {},
  body = null,
  contentType = "application/json",
}) {
  if (!appSecret || !path) throw new Error("appSecret và path là bắt buộc");

  const exclude = new Set(["sign", "access_token"]);
  const keys = Object.keys(params || {}).filter(
    (k) =>
      !exclude.has(k) &&
      params[k] !== "" &&
      params[k] !== null &&
      params[k] !== undefined
  );

  keys.sort();
  const paramStr = keys.map((k) => `${k}${params[k]}`).join("");

  // build path + params
  let str = path + paramStr;

  // IMPORTANT: include body JSON nếu body !== null (kể cả {} rỗng)
  if (contentType !== "multipart/form-data" && body !== null) {
    // ensure stable stringify: JSON.stringify with default is fine for our use
    str += JSON.stringify(body);
  }

  const stringToSign = `${appSecret}${str}${appSecret}`;

  // HMAC-SHA256, hex lowercase (the doc / practice expects lowercase)
  const sign = crypto.createHmac("sha256", appSecret).update(stringToSign).digest("hex");

  // debug helpful logs (bật khi cần)
  // console.log("🔐 stringToSign:", stringToSign);
  // console.log("🔏 sign:", sign);

  return sign;
}


export function generateTikTokSignForGetAuthorizedShops({
    appSecret,
    path,
    params = {},
    body = null,
    contentType = "application/json",
    method = "GET",
}) {
    const exclude = new Set(["sign", "access_token"]);
    const keys = Object.keys(params).filter(
        (k) => !exclude.has(k) && params[k] !== "" && params[k] !== null && params[k] !== undefined
    );
    keys.sort();

    const paramStr = keys.map((k) => `${k}${params[k]}`).join("");
    let str = path + paramStr;

    // ✅ chỉ thêm body nếu method != GET và contentType != multipart
    if (method !== "GET" && contentType !== "multipart/form-data" && body && Object.keys(body).length > 0) {
        str += JSON.stringify(body);
    }

    const stringToSign = `${appSecret}${str}${appSecret}`;
    const sign = crypto.createHmac("sha256", appSecret).update(stringToSign).digest("hex");
    return sign;
}
