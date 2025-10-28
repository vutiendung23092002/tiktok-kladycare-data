import { getOrderDetail } from "../api/tiktok.order_detail.js";
import fs from "fs";
import path from "path";
import { writeWebhookLog } from "../utils/writelog.js";

const DATA_PATH = path.join(process.cwd(), "src", "data", "webhook_order.json");

/**
 * Đọc file lưu order
 * @returns {Array}
 */
function readOrders() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, "utf8");
      return raw.trim() ? JSON.parse(raw) : [];
    }
    return [];
  } catch (err) {
    writeWebhookLog("ERROR", `Lỗi đọc file JSON: ${err.message}`);
    return [];
  }
}

/**
 * Lưu danh sách order vào file JSON
 * @param {Array} data
 */
function saveOrders(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    writeWebhookLog("ERROR", `Lỗi ghi file JSON: ${err.message}`);
  }
}

/**
 * Xử lý khi nhận webhook từ TikTok
 */
export async function handleTikTokWebhook(req, res) {
  try {
    console.log("🚀 Webhook TikTok hit rồi bro!");
    const body = req.body;
    console.log("🧠 BODY NHẬN VỀ:", req.body);
    const orderId = body?.data?.order_id;

    if (!orderId) {
      writeWebhookLog("WARN", "⚠️ Webhook thiếu order_id");
      return res.status(400).json({ message: "Missing order_id" });
    }

    writeWebhookLog("INFO", `📩 Nhận webhook từ TikTok cho order: ${orderId}`);

    // Gọi API TikTok lấy detail đơn hàng
    const details = await getOrderDetail([orderId]);
    if (!details || !details.length) {
      writeWebhookLog("WARN", `⚠️ Không tìm thấy chi tiết đơn ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }

    const currentOrders = readOrders();
    const index = currentOrders.findIndex((o) => o.id === orderId);

    if (index >= 0) {
      currentOrders[index] = details[0];
      writeWebhookLog("UPDATE", `♻️ Cập nhật order ${orderId}`);
    } else {
      currentOrders.push(details[0]);
      writeWebhookLog("INSERT", `✅ Thêm order mới ${orderId}`);
    }

    saveOrders(currentOrders);

    res.json({ success: true });
  } catch (err) {
    writeWebhookLog("ERROR", `❌ Lỗi xử lý webhook: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}
