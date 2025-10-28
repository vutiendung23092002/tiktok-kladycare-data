/**
 * Convert giờ VN sang timestamp UTC (giây)
 * @param {string} datetimeStr - Định dạng "YYYY/MM/DD HH:mm:ss"
 */
export function vnTimeToUTCTimestampRaw(datetimeStr) {
  const normalized = datetimeStr.replace(/\//g, "-");
  const dateVN = new Date(normalized);
  return Math.floor(dateVN.getTime() / 1000);
}

/**
 * Convert từ timestamp UTC → giờ Việt Nam (YYYY/MM/DD HH:mm:ss)
 * @param {number} utcTimestamp - timestamp tính bằng giây (UTC)
 * @returns {string} thời gian theo giờ Việt Nam
 */
export function utcToVNTime(utcTimestamp) {
  if (!utcTimestamp) return null;

  // Nhân 1000 vì JS Date nhận milliseconds
  const dateUTC = new Date(utcTimestamp * 1000);

  // Tính thời gian Việt Nam = UTC + 7 tiếng (luôn tính tay, không phụ thuộc timezone local)
  const vnMillis = dateUTC.getTime() + 7 * 60 * 60 * 1000;
  const dateVN = new Date(vnMillis);

  // Format: YYYY/MM/DD HH:mm:ss
  const yyyy = dateVN.getUTCFullYear();
  const mm = String(dateVN.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dateVN.getUTCDate()).padStart(2, "0");
  const hh = String(dateVN.getUTCHours()).padStart(2, "0");
  const mi = String(dateVN.getUTCMinutes()).padStart(2, "0");
  const ss = String(dateVN.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
}