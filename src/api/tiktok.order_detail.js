import axios from "axios";
import { config } from "../config/env.config.js";
import { generateTikTokSignForGetAuthorizedShops } from "../utils/generateTikTokSign.js";
import { writeSyncLog } from "../utils/writelog.js";

export async function getOrderDetail(orderIds = []) {
    if (!orderIds.length) {
        console.log("Không có order_id nào để lấy chi tiết!");
        return;
    }

    const path = "/order/202507/orders";
    const appSecret = config.tiktok.app_secret;
    const accessToken = config.tiktok.access_token;
    const shopCipher = config.tiktok.cipher;


    // Params bắt buộc
    const params = {
        app_key: config.tiktok.app_key,
        timestamp: Math.floor(Date.now() / 1000),
        shop_cipher: shopCipher,
        ids: orderIds.join(","),
    };

    const body = {
    };

    // Tạo sign
    const sign = generateTikTokSignForGetAuthorizedShops({ appSecret, path, params, body });
    params.sign = sign;

    const headers = {
        "x-tts-access-token": accessToken,
        "content-type": "application/json",
    };

    const url = `${config.tiktok.open_endpoint.replace(/\/$/, "")}${path}`;

    try {
        const res = await axios.get(url, { headers, params });
        return res.data.data.orders;
    } catch (err) {
        console.log("Lỗi khi gọi getOrderDetail:");
        if (err.response) {
            writeSyncLog("ERROR", `[TikTok.order_detail.js] Status: ${err.response.status}`)
            writeSyncLog("ERROR", `[TikTok.order_detail.js] Data: ${JSON.stringify(err.response.data, null, 2)}`)
        } else {
            writeSyncLog("ERROR", `[TikTok.order_detail.js] Lỗi khi lấy chi tiết đơn hàng: ${err.message}`)
        }
    }
}
