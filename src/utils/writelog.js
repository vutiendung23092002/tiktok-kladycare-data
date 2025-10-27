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
