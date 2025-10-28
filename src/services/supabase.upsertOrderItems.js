import sql from "./supabase.connect.js";

export async function upsertOrderItems(items) {
  if (!items?.length) {
    console.log("Không có order items nào để upsert!");
    return;
  }

  const CHUNK_SIZE = 500;
  console.log(`Upsert ${items.length} order items...`);

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);

    try {
      await sql`
        INSERT INTO order_items ${sql(chunk)}
        ON CONFLICT (item_id)
        DO UPDATE SET
          order_id = EXCLUDED.order_id,
          create_time = EXCLUDED.create_time,
          product_name = EXCLUDED.product_name,
          seller_sku = EXCLUDED.seller_sku,
          is_gift = EXCLUDED.is_gift,
          status = EXCLUDED.status,
          gift_retail_price = EXCLUDED.gift_retail_price,
          platform_discount = EXCLUDED.platform_discount,
          original_price = EXCLUDED.original_price,
          seller_discount = EXCLUDED.seller_discount,
          sale_price = EXCLUDED.sale_price,
          hash = EXCLUDED.hash;
      `;
      console.log(`Batch ${i / CHUNK_SIZE + 1}: ${chunk.length} record ok`);
    } catch (err) {
      console.error(`Lỗi batch ${i / CHUNK_SIZE + 1}:`, err.message);
    }
  }
}
