import { writeSyncLog } from "./writelog.js";

/**
 * Hàm lấy thời gian còn lại của token + thời gian hết hạn (giờ VN)
 * @param {string} type - 'access_token' hoặc 'refresh_token'
 * @returns {{
 *   expireTime: number,
 *   expireDateVN: string,
 *   remainingSeconds: number,
 *   remainingMinutes: number,
 *   remainingHours: number
 * }}
 */
export function getTokenRemainingTime(type = "access_token") {
    const now = Math.floor(Date.now() / 1000); // Thời gian hiện tại (UNIX)
    const expireEnvKey =
        type === "access_token" ? "ACCESS_TOKEN_EXPIRE_IN" : "REFRESH_TOKEN_EXPIRE_IN";

    const expireTime = parseInt(process.env[expireEnvKey], 10);

    if (!expireTime) {
        throw new Error(`[Token Check] Không tìm thấy ${expireEnvKey} trong .env`);
    }

    const remainingSeconds = expireTime - now;
    const remainingMinutes = (remainingSeconds / 60).toFixed(2);
    const remainingHours = (remainingSeconds / 3600).toFixed(2);

    // Convert timestamp -> ngày giờ Việt Nam (GMT+7)
    const expireDateVN = new Date(expireTime * 1000).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
    });

    return {
        expireTime,
        expireDateVN,
        remainingSeconds,
        remainingMinutes,
        remainingHours,
    };
}

/**
 * Hàm kiểm tra token đã hết hạn hay chưa
 * @param {string} type - 'access' hoặc 'refresh'
 * @returns {boolean}
 */
export function isTokenExpired(type = "access_token") {
    const { remainingSeconds } = getTokenRemainingTime(type);
    return remainingSeconds <= 0;
}

export function logTokenStatus() {
    try {
        const access = getTokenRemainingTime("access_token");
        const refresh = getTokenRemainingTime("refresh_token");

        writeSyncLog("SUCCESS", `🔐 ACCESS_TOKEN: hết hạn vào ${access.expireDateVN} còn ${access.remainingHours}h (${access.remainingMinutes} phút)`);
        writeSyncLog("SUCCESS", `♻️ REFRESH_TOKEN: hết hạn vào ${refresh.expireDateVN} còn ${refresh.remainingHours}h (${refresh.remainingMinutes} phút)`);

        if (isTokenExpired("access_token")) {
            writeSyncLog("ERROR","ACCESS_TOKEN tiktok đã hết hạn! Đang lấy lại access token tiktok");
        } 

        if (isTokenExpired("refresh_token")) {
            writeSyncLog("ERROR","REFRESH_TOKEN tiktok đã hết hạn! Vui lòng truy cập https://seller-vn.tiktok.com/services/market đăng nhập và cấp quyền lại cho app");
        }
    } catch (err) {
        console.error("Lỗi kiểm tra token:", err.message);
    }
}