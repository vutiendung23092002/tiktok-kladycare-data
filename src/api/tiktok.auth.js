import axios from "axios";
import { config } from "../config/env.config.js";
import { writeSyncLog } from "../utils/writelog.js";
import { updateEnvTokens } from "../utils/updateEnv.js"
import { generateTikTokSignForGetAuthorizedShops } from "../utils/generateTikTokSign.js"

export async function getTikTok_x_tts_access_token(auth_code) {
    console.log("[TikTok.auth.js] Đang gọi API lấy token Tiktok x_tts_access_token...");

    try {
        const url = `${config.tiktok.auth_endpoint}/get`;
        const params = {
            app_key: config.tiktok.app_key,
            app_secret: config.tiktok.app_secret,
            auth_code: auth_code,
            grant_type: "authorized_code",
        }

        const res = await axios.get(url, { params });

        if (res.data.code !== 0) {
            writeSyncLog("ERROR", `[TikTok.auth.js] Lỗi lấy token: ${res.data.message}`)
        }

        const data = res.data.data;
        console.log(data);
        writeSyncLog("SUCCESS", `[TikTok.auth.js] Get token thành công!`)
        updateEnvTokens({
            ACCESS_TOKEN: data.access_token,
            ACCESS_TOKEN_EXPIRE_IN: data.access_token_expire_in,
            REFRESH_TOKEN: data.refresh_token,
            REFRESH_TOKEN_EXPIRE_IN: data.refresh_token_expire_in,
        });

        return data;
    } catch (err) {
        writeSyncLog("ERROR", `[TikTok.auth.js] Lỗi lấy token: ${err.response?.data || err.message}`)
        throw err;
    }
}

export async function refreshTikTok_x_tts_access_token() {
    console.log("[TikTok.auth.js] Đang refresh access_token...");

    const url = `${config.tiktok.auth_endpoint}/refresh`;
    const params = {
        app_key: config.tiktok.app_key,
        app_secret: config.tiktok.app_secret,
        refresh_token: config.tiktok.refresh_token,
        grant_type: "refresh_token",
    };

    try {
        const res = await axios.get(url, { params });

        if (res.data.code !== 0) {
            writeSyncLog("ERROR", `[TikTok.auth.js] Lỗi lấy token: ${res.data.message}`)
        }

        const data = res.data.data;
        writeSyncLog("SUCCESS", `[TikTok.auth.js] Refresh token thành công!`)
        updateEnvTokens({
            ACCESS_TOKEN: data.access_token,
            ACCESS_TOKEN_EXPIRE_IN: data.access_token_expire_in,
            REFRESH_TOKEN: data.refresh_token,
            REFRESH_TOKEN_EXPIRE_IN: data.refresh_token_expire_in,
        });

        return data;
    } catch (err) {
        writeSyncLog("ERROR", `[TikTok.auth.js] Lỗi lấy token: ${err.response?.data || err.message}`)
        throw err;
    }
}

export async function getAuthorizedShops() {
  const path = "/authorization/202309/shops";
  const appKey = config.tiktok.app_key;
  const appSecret = config.tiktok.app_secret;
  const accessToken = config.tiktok.access_token;

  const params = {
    app_key: appKey,
    timestamp: Math.floor(Date.now() / 1000),
  };

  const body = {};

  const sign = generateTikTokSignForGetAuthorizedShops({ appSecret, path, params, body });
  params.sign = sign;

  console.log("🧩 Params gửi:", params);
  console.log("🔏 Sign:", sign);

  const headers = {
    "x-tts-access-token": accessToken,
    "content-type": "application/json",
  };

  const url = `${config.tiktok.open_endpoint.replace(/\/$/, "")}${path}`;

  try {
    const res = await axios.get(url, { headers, params });
    console.log("✅ Response:", res.data.data);
  } catch (err) {
    console.log("❌ Axios Error:");
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.log(err.message);
    }
  }
}
