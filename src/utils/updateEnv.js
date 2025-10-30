import fs from "fs";

// export function updateEnvTokens(newValues) {
//     const envPath = ".env";
//     let content = "";
//     try {
//         content = fs.readFileSync(envPath, "utf-8");
//     } catch {
//         content = "";
//     }
//     const lines = content.split("\n");
//     const upsert = (key, val) => {
//         const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
//         if (idx !== -1) lines[idx] = `${key}=${val}`;
//         else lines.push(`${key}=${val}`);
//     };
//     for (const [k, v] of Object.entries(newValues)) upsert(k, v);
//     fs.writeFileSync(envPath, lines.join("\n"));
//     console.log("[TikTok.auth.js] .env đã cập nhật token mới");
// }


/**
 * Cập nhật (hoặc thêm mới) các token TikTok vào file .env
 * @param {Object} newValues - { ACCESS_TOKEN, REFRESH_TOKEN, ... }
 */
export function updateEnvTokens(newValues) {
  const envPath = ".env";

  // Đọc file hiện tại (nếu có)
  let content = "";
  try {
    content = fs.readFileSync(envPath, "utf8");
  } catch {
    content = "";
  }

  // Chuẩn hóa từng dòng (loại bỏ \r hoặc khoảng trắng)
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  // Hàm upsert key=value
  const upsert = (key, val) => {
    const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
    if (idx !== -1) {
      lines[idx] = `${key}=${val}`;
    } else {
      lines.push(`${key}=${val}`);
    }
  };

  // Ghi lại từng token mới
  for (const [k, v] of Object.entries(newValues)) upsert(k, v);

  // Ghi file lại với newline cuối
  fs.writeFileSync(envPath, lines.join("\n") + "\n", "utf8");

  console.log(
    `[TikTok.auth.js] ✅ .env đã cập nhật token mới: ${Object.keys(newValues).join(", ")}`
  );
}
