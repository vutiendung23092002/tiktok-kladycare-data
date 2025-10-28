import fs from "fs/promises";

import { getListOrder } from "./src/api/tiktok.order.js";
import { getOrderDetail } from "./src/api/tiktok.order_detail.js";

import { ensureOrderTable } from "./src/services/supabase.ensureOrderTable.js";
import { ensureOrderItemTable } from "./src/services/supabase.ensureOrderItemTable.js";
import { insertOrders } from "./src/services/supabase.insertOrders.js";
import { insertOrderItems } from "./src/services/supabase.insertOrderItems.js"

import { formatTikTokOrder, formatTikTokOrderItem } from "./src/utils/formatTikTokOrder.js";
import { logTokenStatus } from "./src/utils/tokenExpiration.js";

(async () => {
  logTokenStatus();

  console.log("Bắt đầu sync TikTok → Supabase...");

  await ensureOrderTable();
  await ensureOrderItemTable();

  let allOrdersDetail = [];
  let nextPageToken = null;
  let page = 1;
  let start = "2025/10/25 00:00:00"; // Giờ VN
  let end = "2025/10/28 23:59:59"; // Giờ VN

  do {
    console.log(`Đang lấy trang ${page}...`);
    const res = await getListOrder(nextPageToken, start, end);
    // Nếu lỗi hoặc không có data thì dừng
    if (!res || !res.orders) {
      console.log("Không có dữ liệu trả về hoặc token sai, dừng lại.");
      break;
    }
    const ids = res.orders.map((o) => o.id).filter(Boolean);

    const chunkSize = 50;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const batchIds = ids.slice(i, i + chunkSize);

      const orderDetails = await getOrderDetail(batchIds);

      if (Array.isArray(orderDetails) && orderDetails.length > 0) {
        allOrdersDetail.push(...orderDetails);
      } else {
        console.log("Không đơn hàng nào trả về cho batch này");
      }

      await new Promise((r) => setTimeout(r, 100));
    }

    nextPageToken = res.next_page_token;
    page++;
  } while (nextPageToken);

  console.log(`Tổng cộng ${allOrdersDetail.length} đơn hàng`);

  const formattedOrder = allOrdersDetail.map(formatTikTokOrder);
  const formattedOrderItems = allOrdersDetail.flatMap(formatTikTokOrderItem).filter(Boolean);

  await insertOrders(formattedOrder);
  await insertOrderItems(formattedOrderItems);

  // Lưu JSON kết quả
  await fs.writeFile(
    "./src/data/order_item.json",
    JSON.stringify(formattedOrderItems, null, 2),
    "utf-8"
  );

  await fs.writeFile(
    "./src/data/all_order_details.json",
    JSON.stringify(formattedOrder, null, 2),
    "utf-8"
  );

  console.log("Đã lưu all_orders.json và đẩy lên Supabase!");
})();
