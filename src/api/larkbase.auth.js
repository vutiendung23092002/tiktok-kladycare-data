import axios from "axios";
import dotenv from "dotenv";
import { config } from "../config/env.config.js";
dotenv.config();

/**
 *  Lấy tenant_access_token (dùng để gọi API Bitable, Sheets,...)
 */
export async function getTenantAccessToken() {

    try {
        const res = await axios.post(
            config.lark.endpointLark_auth,
            {
                app_id: config.lark.app_id,
                app_secret: config.lark.app_secret,
            },
            { headers: { "Content-Type": "application/json" } }
        );

        if (res.data.code !== 0) {
            writeSyncLog("ERROR" ,`[LARK_AUTH]-larkbase.auth.js - Không lấy được tenant_access_token: ${res.data.msg}`)
            throw new Error(res.data.msg);
        }

        console.log("[LARK_AUTH] Đã lấy tenant_access_token thành công!");
        const token = res.data.tenant_access_token;
    
        return token;
    } catch (err) {
        writeSyncLog("ERROR" ,`[LARK_AUTH]-larkbase.auth.js - Lỗi khi gọi Lark API: ${err.response?.data || err.message}`)
        throw err;
    }
}

/**
 *  Lấy app_access_token
 */
export async function getAppAccessToken() {
    const url = "https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal";

    try {
        const res = await axios.post(
            url,
            {
                app_id: config.lark.app_id,
                app_secret: config.lark.app_secret,
            },
            { headers: { "Content-Type": "application/json" } }
        );

        if (res.data.code !== 0) {
            writeSyncLog("ERROR" ,`[LARK_AUTH]-larkbase.auth.js - Lỗi khi lấy app_access_token: ${res.data.msg}`)
            throw new Error(res.data.msg);
        }

        console.log("[LARK_AUTH] Đã lấy app_access_token thành công!");
        const token = res.data.app_access_token;
        return token;
    } catch (err) {
        writeSyncLog("ERROR" ,`[LARK_AUTH]-larkbase.auth.js - Lỗi khi gọi Lark API: ${err.response?.data || err.message}`)
        throw err;
    }
}
