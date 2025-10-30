import { Client } from "@larksuiteoapi/node-sdk";
import { config } from "../config/env.config.js"

export const client = new Client({
    appId: config.lark.app_id,
    appSecret: config.lark.app_secret,
    disableTokenCache: false,
});
