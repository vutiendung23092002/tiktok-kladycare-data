import fs from "fs";
import path from "path";

export function writeSyncLog(type, message) {
  const logDir = path.resolve("logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  // Nếu là lỗi → ghi vào file error.log
  const isError = type?.toUpperCase() === "ERROR";
  const logFile = path.join(
    logDir,
    isError ? "error.log" : "success.log"
  );

  // Lấy giờ Việt Nam (UTC+7)
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const time = vnTime.toISOString().replace("T", " ").replace("Z", "");

  const line = `[${time}] [${type.toUpperCase()}] ${message}\n`;

  // Ghi log vào file
  fs.appendFileSync(logFile, line, "utf8");

  // In ra console cho tiện debug
  if (isError) {
    console.error(`${line.trim()}`);
  } else {
    console.log(line.trim());
  }
}

/**
 * Ghi log dành riêng cho webhook (chia file theo ngày)
 * @param {"INFO"|"WARN"|"ERROR"} type
 * @param {string} message
 */
export function writeWebhookLog(type, message) {
  const logDir = path.resolve("logs/webhook");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  // Tạo file log theo ngày (VD: logs/webhook/2025-10-28.log)
  const dateStr = new Date().toISOString().slice(0, 10);
  const logFile = path.join(logDir, `${dateStr}.log`);

  // Giờ VN
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const time = vnTime.toISOString().replace("T", " ").replace("Z", "");

  const line = `[${time}] [${type.toUpperCase()}] ${message}\n`;

  // Ghi log
  fs.appendFileSync(logFile, line, "utf8");

  // Hiển thị ra console
  if (type.toUpperCase() === "ERROR") console.error(line.trim());
  else console.log(line.trim());
}