import { getOrderDetail } from "./src/api/tiktok.order_detail.js";
import { getListOrder } from "./src/api/tiktok.order.js";
import fs from "fs/promises";

(async () => {
    const startDate = "2025/10/25 00:00:00";
    const endDate = "2025/10/31 23:59:59";
    let allOrdersDetail = [];
    let nextPageToken = null;
    let page = 1;

    do {
        console.log(`Đang lấy trang ${page}...`);
        const res = await getListOrder(nextPageToken, startDate, endDate);
        // Nếu lỗi hoặc không có data thì dừng
        if (!res || !res.orders) {
            console.log("Không có dữ liệu trả về hoặc token sai, dừng lại.");
            break;
        }
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

        nextPageToken = res.next_page_token;
        page++;
        await new Promise((r) => setTimeout(r, 200));
    } while (nextPageToken);

    await fs.writeFile(
        "./src/data/all_order_details.json",
        JSON.stringify(allOrdersDetail, null, 2),
        "utf-8"
    );
})();
