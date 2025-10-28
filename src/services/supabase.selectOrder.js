import sql from "./supabase.connect.js";

/**
 * Lấy danh sách order_id + hash trong khoảng thời gian
 * @param {string} startDate - ví dụ: "2025/01/01 00:00:00"
 * @param {string} endDate - ví dụ: "2025/03/31 23:59:59"
 * @returns {Promise<Array<{order_id: string, hash: string}>>}
 */
export async function selectOrdersByDate(startDate, endDate) {
  console.log(`Lấy orders từ ${startDate} → ${endDate}`);

  try {
    const rows = await sql`
      SELECT order_id, hash
      FROM orders
      WHERE create_time::text BETWEEN ${startDate} AND ${endDate};
    `;
    console.log(`Đã lấy ${rows.length} orders trong khoảng thời gian.`);
    return rows;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu orders theo ngày:", err.message);
    return [];
  }
}
