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
  }
};
