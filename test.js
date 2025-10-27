import fs from "fs/promises";
import { getListOrder } from "./src/api/tiktok.order.js";
import { logTokenStatus } from "./src/utils/tokenExpiration.js";
import { formatTikTokOrder } from "./src/utils/formatTikTokOrder.js";

(async () => {
  logTokenStatus();

  let allOrders = [];
  let nextPageToken = null;
  let page = 1;

  do {
    console.log(`🔄 Đang lấy trang ${page}...`);
    const res = await getListOrder(nextPageToken);
    const { orders = [], next_page_token } = res;

    const formatted = orders.map(formatTikTokOrder);
    allOrders.push(...formatted);

    nextPageToken = next_page_token;
    console.log(`✅ Trang ${page}: ${formatted.length} đơn`);
    page++;

    await new Promise((r) => setTimeout(r, 200));
  } while (nextPageToken);

  console.log(`🎉 Hoàn tất! Tổng cộng ${allOrders.length} đơn hàng.`);

  await fs.writeFile(
    "./src/data/all_orders.json",
    JSON.stringify(allOrders, null, 2),
    "utf-8"
  );
})();
