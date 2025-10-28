import sql from "./supabase.connect.js";

/**
  * Lấy danh sách order_id + hash trong khoảng thời gian
 * @param {string} startDate - ví dụ: "2025/01/01 00:00:00"
 * @param {string} endDate - ví dụ: "2025/03/31 23:59:59"
 * @returns {Promise<Array<{ item_id: string, hash_item: string }>>}
 */
export async function selectOrderItemsByDate(startDate, endDate) {
  console.log(`Lấy order items từ ${startDate} → ${endDate}`);

  try {
    const rows = await sql`
      SELECT item_id, hash
      FROM order_items
      WHERE create_time::text BETWEEN ${startDate} AND ${endDate};
    `;
    console.log(`Đã lấy ${rows.length} order items trong khoảng thời gian.`);
    return rows;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu order_items theo ngày:", err.message);
    return [];
  }
}
