import { logTokenStatus } from "../utils/tokenExpiration.js";
import { writeSyncLog } from "../utils/writelog.js";

import { getListOrder } from "../api/tiktok.order.js";
import { getOrderDetail } from "../api/tiktok.order_detail.js";

import { formatTikTokOrder, formatTikTokOrderItem } from "../utils/formatTikTokOrder.js";
import { diffRecords } from "./syncDiff.js";

import { ensureOrderTable, ensureOrderItemTable, selectOrdersHashByDate, selectOrderItemsHashByDate, upsertOrders, upsertOrderItems } from "../services/supabase.service.js";

import fs from "fs/promises";

/**
 * Đồng bộ dữ liệu từ TikTok → Supabase trong khoảng thời gian cụ thể
 * @param {string} startDate - ví dụ "2025/10/23 00:00:00" (giờ VN)
 * @param {string} endDate - ví dụ "2025/10/27 23:59:59" (giờ VN)
 */
export async function syncTiktokToSupabase(startDate, endDate) {
    await logTokenStatus();

    await ensureOrderTable();
    await ensureOrderItemTable();
    console.log(`Bắt đầu sync TikTok → Supabase từ ${startDate} → ${endDate}`);

    let allOrdersDetail = [];
    let nextPageToken = null;
    let page = 1;

    // ==============================
    // 1️. Lấy dữ liệu mới từ TikTok
    // ==============================
    console.log(`Đang lấy data từ ${startDate} đến ${endDate}`);
    do {
        console.log("Đang lấy data page ", nextPageToken);

        const res = await getListOrder(nextPageToken, startDate, endDate);

        if (!res || !res.orders) {
            console.log("Không có dữ liệu trả về từ TikTok hoặc token hết hạn!");
            break;
        }

        const ids = res.orders.map((o) => o.id).filter(Boolean);

        // Lấy chi tiết đơn theo từng batch 50
        const chunkSize = 50;
        for (let i = 0; i < ids.length; i += chunkSize) {
            const batchIds = ids.slice(i, i + chunkSize);
            const orderDetails = await getOrderDetail(batchIds);

            if (Array.isArray(orderDetails) && orderDetails.length > 0) {
                allOrdersDetail.push(...orderDetails);
            }

            await new Promise((r) => setTimeout(r, 50)); // tránh rate limit
        }

        nextPageToken = res.next_page_token;
        page++;
    } while (nextPageToken);

    console.log(` Đã lấy ${allOrdersDetail.length} đơn hàng từ TikTok.`);

    // ==============================
    // 2️. Format lại dữ liệu
    // ==============================
    const formattedOrders = allOrdersDetail.map(formatTikTokOrder);
    const formattedOrderItems = allOrdersDetail.flatMap(formatTikTokOrderItem).filter(Boolean);

    // ==============================
    // 3️. Lấy dữ liệu cũ từ Supabase
    // ==============================
    const oldOrders = await selectOrdersHashByDate(startDate, endDate);
    const oldOrderItems = await selectOrderItemsHashByDate(startDate, endDate);

    // ==============================
    // 4️. So sánh hash (diff)
    // ==============================
    const { toUpsert: ordersToUpsert } = diffRecords(formattedOrders, oldOrders, "order_id", "hash");
    const { toUpsert: itemsToUpsert } = diffRecords(formattedOrderItems, oldOrderItems, "item_id", "hash");

    console.log(`
    Diff kết quả:
    Orders cần upsert: ${ordersToUpsert.length}
    Items cần upsert: ${itemsToUpsert.length}
        `);

    // ==============================
    // 5. Upsert lên Supabase
    // ==============================
    if (ordersToUpsert.length > 0) {
        await upsertOrders(ordersToUpsert);
    } else {
        console.log("Không có order nào cần thêm hoặc update.");
    }

    if (itemsToUpsert.length > 0) {
        await upsertOrderItems(itemsToUpsert);
    } else {
        console.log("Không có item nào cần thêm hoặc update.");
    }

    writeSyncLog("SUCCESS", `Đồng bộ thành công tiktok -> supabase`);

}
