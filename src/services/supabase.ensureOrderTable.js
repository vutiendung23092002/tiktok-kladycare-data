import sql from "./supabase.connect.js";

export async function ensureOrderTable() {
  console.log("Kiểm tra bảng 'orders'...");

  try {
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id NUMERIC PRIMARY KEY,
          cancel_order_sla_time TEXT,
          cancellation_initiator TEXT,
          create_time TEXT,
          packages JSONB,
          sub_total NUMERIC,
          shipping_fee NUMERIC,
          seller_discount NUMERIC,
          platform_discount NUMERIC,
          total_amount NUMERIC,
          original_total_product_price NUMERIC,
          tax NUMERIC,
          product_tax NUMERIC,
          handling_fee NUMERIC,
          status TEXT,
          fulfillment_type TEXT,
          paid_time TEXT,
          cancel_reason TEXT,
          cancel_time TEXT,
          cpf TEXT,
          delivery_due_time TEXT,
          delivery_time TEXT,
          commerce_platform TEXT,
          hash TEXT
        );
      `);
  } catch (err) {
    writeSyncLog("ERROR", `[supabase.ensureOrderTable.js] Lỗi khi kiểm tra/tạo bảng 'orders_item':`)
    writeSyncLog("ERROR", `[supabase.ensureOrderTable.js] Message: ${err.message}`)

    if (err.detail) writeSyncLog("ERROR", `[supabase.ensureOrderTable.js] Detail: ${err.detail}`)
    if (err.position) writeSyncLog("ERROR", `[supabase.ensureOrderTable.js] Position: ${err.position}`)

    throw err;
  }
}
