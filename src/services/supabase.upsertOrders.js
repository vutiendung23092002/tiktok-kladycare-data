import sql from "./supabase.connect.js";

export async function upsertOrders(orders) {
  if (!orders?.length) {
    console.log("⚠️ Không có orders nào để upsert!");
    return;
  }

  const CHUNK_SIZE = 500;
  console.log(`Upsert ${orders.length} orders...`);

  for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
    const chunk = orders.slice(i, i + CHUNK_SIZE);

    try {
      await sql`
        INSERT INTO orders ${sql(chunk)}
        ON CONFLICT (order_id)
        DO UPDATE SET
          cancel_order_sla_time = EXCLUDED.cancel_order_sla_time,
          cancellation_initiator = EXCLUDED.cancellation_initiator,
          create_time = EXCLUDED.create_time,
          packages = EXCLUDED.packages,
          sub_total = EXCLUDED.sub_total,
          shipping_fee = EXCLUDED.shipping_fee,
          seller_discount = EXCLUDED.seller_discount,
          platform_discount = EXCLUDED.platform_discount,
          total_amount = EXCLUDED.total_amount,
          original_total_product_price = EXCLUDED.original_total_product_price,
          tax = EXCLUDED.tax,
          product_tax = EXCLUDED.product_tax,
          handling_fee = EXCLUDED.handling_fee,
          status = EXCLUDED.status,
          fulfillment_type = EXCLUDED.fulfillment_type,
          paid_time = EXCLUDED.paid_time,
          cancel_reason = EXCLUDED.cancel_reason,
          cancel_time = EXCLUDED.cancel_time,
          cpf = EXCLUDED.cpf,
          delivery_due_time = EXCLUDED.delivery_due_time,
          delivery_time = EXCLUDED.delivery_time,
          commerce_platform = EXCLUDED.commerce_platform,
          hash = EXCLUDED.hash;
      `;
      console.log(`Batch ${i / CHUNK_SIZE + 1}: ${chunk.length} record ok`);
    } catch (err) {
      console.error(`Lỗi batch ${i / CHUNK_SIZE + 1}:`, err.message);
    }
  }
}
