import sql from "./supabase.connect.js";
import { writeSyncLog } from "../utils/writelog.js";

export async function ensureOrderItemTable() {
  console.log("Kiểm tra bảng 'order_items'...");

  try {
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS order_items (
          item_id NUMERIC PRIMARY KEY,
          order_id NUMERIC,
          create_time TEXT,
          product_name TEXT,
          seller_sku TEXT,
          is_gift BOOLEAN,
          status TEXT,
          gift_retail_price NUMERIC,
          platform_discount NUMERIC,
          original_price NUMERIC,
          seller_discount NUMERIC,
          sale_price NUMERIC,
          hash TEXT
        );
      `);
  } catch (err) {
    writeSyncLog("ERROR", `[supabase.ensureOrderItemTable.js] Lỗi khi kiểm tra/tạo bảng 'orders_item':`)
    writeSyncLog("ERROR", `[supabase.ensureOrderItemTable.js] Message: ${err.message}`)

    if (err.detail) writeSyncLog("ERROR", `[supabase.ensureOrderItemTable.js] Detail: ${err.detail}`)
    if (err.position) writeSyncLog("ERROR", `[supabase.ensureOrderItemTable.js] Position: ${err.position}`)

    throw err;
  }
}
