import dotenv from "dotenv";
dotenv.config();

export const config = {
  tiktok: {
    auth_code: process.env.AUTH_CODE,// auth code này chỉ sài được một lần để lấy access token nên đã xoá trong env không dùng nữa
    auth_endpoint: process.env.ENDPOINT_AUTH_TIKTOK,
    open_endpoint: process.env.ENDPOINT_PUBLIC_TIKTOK,
    cipher: process.env.CIPHER,
    app_key: process.env.APP_KEY_TIKTOK_KLADYCARE,
    app_secret: process.env.APP_SECRET_TIKTOK_KLADYCARE,
    access_token: process.env.ACCESS_TOKEN,
    access_token_expire_in: process.env.ACCESS_TOKEN_EXPIRE_IN,
    refresh_token: process.env.REFRESH_TOKEN,
    refresh_token_expire_in: process.env.REFRESH_TOKEN_EXPIRE_IN,
  },
  supabase: {
    database_url: process.env.DATABASE_URL,
  },
  lark: {
    endpointLark_auth: process.env.LARK_API_DOMAIN_AUTH,
    app_id: process.env.LARK_APP_ID,
    app_secret: process.env.LARK_APP_SECRET,
    base_id: process.env.BASE_ID,
  },
  kiotviet: {
    clientId: process.env.KIOTVIET_CLIENT_ID,
    clientSecret: process.env.KIOTVIET_CLIENT_SECRET,
    endpointKiot_auth: process.env.KIOTVIET_API_DOMAIN_AUTH,
    endpointKiot_public: process.env.KIOTVIET_API_DOMAIN_PUBLIC,
    retailer: process.env.KIOTVIET_RETAILER,
  },
};
