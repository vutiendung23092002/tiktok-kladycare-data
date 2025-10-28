import crypto from "crypto";

/**
 * Tạo hash SHA256 cho một object — bỏ qua các key được exclude (nếu có)
 * @param {Object} obj - Object cần hash
 * @param {Array<string>} excludeKeys - Danh sách các key cần loại trừ khỏi hash
 * @returns {string} Hash SHA256 (hex string)
 */
export function generateHash(obj, excludeKeys = []) {
    if (!obj || typeof obj !== "object") return "";

    // Clone và loại bỏ các key không muốn hash (ví dụ: order_id)
    const filtered = Object.keys(obj)
        .filter((key) => !excludeKeys.includes(key))
        .sort() // Sắp xếp để hash ổn định
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});

    // Convert sang JSON
    const jsonString = JSON.stringify(filtered);

    // Tạo hash SHA256
    return crypto.createHash("sha256").update(jsonString).digest("hex");
}
