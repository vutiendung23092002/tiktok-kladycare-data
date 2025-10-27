/**
 * Convert giờ VN sang timestamp UTC (giây)
 * @param {string} datetimeStr - Định dạng "YYYY/MM/DD HH:mm:ss"
 */
export function vnTimeToUTCTimestampRaw(datetimeStr) {
  const normalized = datetimeStr.replace(/\//g, "-");
  const dateVN = new Date(normalized); // local time (VN)
  // Chuyển sang UTC bằng cách trừ offset 7h
  const utcMillis = dateVN.getTime() - 7 * 60 * 60 * 1000;
  return Math.floor(utcMillis / 1000);
}

/**
 * Convert từ timestamp UTC → giờ Việt Nam (YYYY/MM/DD HH:mm:ss)
 * @param {number} utcTimestamp - timestamp tính bằng giây (UTC)
 * @returns {string} thời gian theo giờ Việt Nam
 */
export function utcToVNTime(utcTimestamp) {
  // Nhân 1000 vì JS Date nhận milliseconds
  const dateUTC = new Date(utcTimestamp * 1000);

  // Cộng thêm 7 tiếng (VN = UTC+7)
  const vnMillis = dateUTC.getTime() + 7 * 60 * 60 * 1000;
  const dateVN = new Date(vnMillis);

  // Format: YYYY/MM/DD HH:mm:ss
  const yyyy = dateVN.getFullYear();
  const mm = String(dateVN.getMonth() + 1).padStart(2, "0");
  const dd = String(dateVN.getDate()).padStart(2, "0");
  const hh = String(dateVN.getHours()).padStart(2, "0");
  const mi = String(dateVN.getMinutes()).padStart(2, "0");
  const ss = String(dateVN.getSeconds()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
}

