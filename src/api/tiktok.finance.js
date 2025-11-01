

export async function getStatements(next_page_token, start_date, end_date) {
    const path = "/finance/202309/statements";
    const appSecret = config.tiktok.app_secret;
    const accessToken = config.tiktok.access_token;
    const shopCipher = config.tiktok.cipher;

    const start = vnTimeToUTCTimestampRaw(start_date);
    const end = vnTimeToUTCTimestampRaw(end_date);

    const params = {
        app_key: config.tiktok.app_key,
        sort_field: "statement_time",
        timestamp: Math.floor(Date.now() / 1000),
        shop_cipher: shopCipher,
        statement_time_ge: start,
        statement_time_lt: end,
        page_size: 200,
        page_token: next_page_token,
    }

    const sign = generateTikTokSignForGetAuthorizedShops({ appSecret, path, params, body });
    params.sign = sign;

    const headers = {
        "x-tts-access-token": accessToken,
        "content-type": "application/json",
    };

    const url = `${config.tiktok.open_endpoint.replace(/\/$/, "")}${path}`;

    try {
        const res = await axios.get(url, { headers, params });
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
