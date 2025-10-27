import sql from "./supabase.connect.js";

export async function ensureOrderItemTable() {
  console.log("Kiểm tra bảng 'order_items'...");

  try {
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS order_items (
          item_id NUMERIC PRIMARY KEY,
          order_id NUMERIC,
          create_time TIMESTAMP,
          product_name TEXT,
          seller_sku TEXT,
          is_gift BOOLEAN,
          status TEXT,
          gift_retail_price NUMERIC,
          platform_discount NUMERIC,
          original_price NUMERIC,
          seller_discount NUMERIC,
          sale_price NUMERIC
        );
      `);
  } catch (err) {
    console.error("Lỗi khi kiểm tra/tạo bảng 'orders_item':");
    console.error("Message:", err.message);

    if (err.detail) console.error("Detail:", err.detail);
    if (err.position) console.error("Position:", err.position);

    throw err;
  }
}
