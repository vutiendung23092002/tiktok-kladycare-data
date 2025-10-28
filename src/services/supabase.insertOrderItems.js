import sql from "./supabase.connect.js";

export async function insertOrderItems(items) {
  if (!items.length) {
    console.log("Không có item nào để insert!");
    return;
  }

  // Chuẩn hoá dữ liệu — chỉ giữ lại field đúng với bảng order_items
  const formatted = items.map((item) => ({
    item_id: Number(item.item_id),
    order_id: Number(item.order_id),
    create_time: item.create_time?.toString() || "",
    product_name: item.product_name || "",
    seller_sku: item.seller_sku || "",
    is_gift: !!item.is_gift,
    status: item.display_status || "",
    gift_retail_price: Number(item.gift_retail_price ?? 0),
    platform_discount: Number(item.platform_discount ?? 0),
    original_price: Number(item.original_price ?? 0),
    seller_discount: Number(item.seller_discount ?? 0),
    sale_price: Number(item.sale_price ?? 0),
    hash: item.hash || "",
  }));

  // Chia nhỏ batch để tránh lỗi MAX_PARAMETERS_EXCEEDED
  const CHUNK_SIZE = 500;
  console.log(
    `Tổng ${formatted.length} item → chia thành ~${Math.ceil(
      formatted.length / CHUNK_SIZE
    )} batch.`
  );

  let totalInserted = 0;

  for (let i = 0; i < formatted.length; i += CHUNK_SIZE) {
    const chunk = formatted.slice(i, i + CHUNK_SIZE);

    try {
      await sql`
        INSERT INTO order_items ${sql(chunk)}
        ON CONFLICT (item_id) DO NOTHING;
      `;

      totalInserted += chunk.length;
      console.log(`Đã insert batch ${i / CHUNK_SIZE + 1} (${chunk.length} item)`);
    } catch (err) {
      console.error(`Lỗi khi insert batch ${i / CHUNK_SIZE + 1}:`, err.message);
      if (err.detail) console.error("Detail:", err.detail);
      if (err.position) console.error("Position:", err.position);
    }
  }

  console.log(`Tổng cộng đã insert ${totalInserted} item vào bảng order_items!`);
}
