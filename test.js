import fs from "fs/promises";
import { getListOrder } from "./src/api/tiktok.order.js";
import { getOrderDetail } from "./src/api/tiktok.order_detail.js";
import { logTokenStatus } from "./src/utils/tokenExpiration.js";
import { formatTikTokOrder } from "./src/utils/formatTikTokOrder.js";

(async () => {
  logTokenStatus();

  let allOrdersDetail = [];
  let nextPageToken = null;
  let page = 1;

  do {
    console.log(`Đang lấy trang ${page} từ /order/search...`);
    const res = await getListOrder(nextPageToken);

    // Nếu lỗi hoặc không có data thì dừng
    if (!res || !res.orders) {
      console.log("Không có dữ liệu trả về hoặc token sai, dừng lại.");
      break;
    }

    // Lấy danh sách ID
    const ids = res.orders.map((o) => o.id).filter(Boolean);

    // Chia nhỏ danh sách ID thành 2 batch (mỗi batch 50 đơn)
    const chunkSize = 50;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const batchIds = ids.slice(i, i + chunkSize);

      const orderDetails = await getOrderDetail(batchIds);

      if (Array.isArray(orderDetails) && orderDetails.length > 0) {
        allOrdersDetail.push(...orderDetails);
      } else {
        console.log("Không đơn hàng nào trả về cho batch này");
      }

      // tránh rate limit
      await new Promise((r) => setTimeout(r, 100));
    }

    // Chuyển sang trang tiếp theo
    nextPageToken = res.next_page_token;
    page++;
  } while (nextPageToken);

  console.log(allOrdersDetail[0]);

  console.log(`Hoàn tất! Tổng cộng ${allOrdersDetail.length} đơn hàng chi tiết đã format.`);

  // Lưu JSON kết quả
  await fs.writeFile(
    "./src/data/all_order_details_formatted.json",
    JSON.stringify(allOrdersDetail, null, 2),
    "utf-8"
  );

  console.log("Đã lưu file all_order_details_formatted.json!");
})();
