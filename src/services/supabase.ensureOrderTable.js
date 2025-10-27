import sql from "./supabase.connect.js";

export async function ensureOrderTable() {
  console.log("Kiểm tra bảng 'orders'...");

  try {
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id NUMERIC PRIMARY KEY,
          cancel_order_sla_time TIMESTAMP,
          cancellation_initiator TEXT,
          create_time TIMESTAMP,
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
          paid_time TIMESTAMP,
          cancel_reason TEXT,
          cancel_time TIMESTAMP,
          cpf TEXT,
          delivery_due_time TIMESTAMP,
          delivery_time TIMESTAMP,
          commerce_platform TEXT
        );
      `);
  } catch (err) {
    console.error("Lỗi khi kiểm tra/tạo bảng 'orders':");
    console.error("Message:", err.message);

    if (err.detail) console.error("Detail:", err.detail);
    if (err.position) console.error("Position:", err.position);

    throw err;
  }
}
