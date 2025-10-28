import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { handleTikTokWebhook } from "./src/webhook/webhook.controller.js";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// Route nhận webhook từ TikTok
app.post("/webhook/tiktok", handleTikTokWebhook);

// Health check route (để test server đang chạy)
app.get("/", (_, res) => res.send("TikTok Webhook Server đang hoạt động!"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Webhook đang chạy tại cổng ${PORT}`)
);
