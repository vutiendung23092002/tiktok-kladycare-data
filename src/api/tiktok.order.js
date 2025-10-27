import axios from "axios";
import { config } from "../config/env.config.js";
import { generateTikTokSign } from "../utils/generateTikTokSign.js"
import { vnTimeToUTCTimestampRaw, utcToVNTime } from "../utils/VNtimeToUTCTimestamp.js"

export async function getListOrder(next_page_token) {
    const path = "/order/202309/orders/search";
    const appSecret = config.tiktok.app_secret;
    const accessToken = config.tiktok.access_token;
    const shopCipher = config.tiktok.cipher;

    const params = {
        app_key: config.tiktok.app_key,
        timestamp: Math.floor(Date.now() / 1000),
        page_size: 100,
        shop_cipher: shopCipher,
        page_token: next_page_token,
    }

    const start = vnTimeToUTCTimestampRaw("2025/10/01 00:00:00");
    const end = vnTimeToUTCTimestampRaw("2025/10/24 23:59:59");

    console.log(`Lấy từ ${utcToVNTime(start)} đến ${utcToVNTime(end)}`);

    const body = {
        create_time_ge: start,
        create_time_le: end,
    };

    const sign = generateTikTokSign({ appSecret, path, params, body });
    params.sign = sign;

    const headers = {
        "x-tts-access-token": accessToken,
        "content-type": "application/json",
    };

    const url = `${config.tiktok.open_endpoint.replace(/\/$/, "")}${path}`;

    try {
        const res = await axios.post(url, body, { headers, params });
        return res.data.data;
    } catch (err) {
        console.log("Axios Error:");
        if (err.response) {
            writeSyncLog("ERROR", `[TikTok.order.js] Status: ${err.response.status}`)
            writeSyncLog("ERROR", `[TikTok.order.js] Data: ${JSON.stringify(err.response.data, null, 2)}`)
        } else {
            console.log(err.message);
            writeSyncLog("ERROR", `[TikTok.order.js] Lỗi khi lấy danh sách đơn hàng: ${err.message}`)
        }
    }
}
