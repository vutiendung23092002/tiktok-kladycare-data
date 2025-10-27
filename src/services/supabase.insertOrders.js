import sql from "./supabase.connect.js";

export async function insertOrders(orders) {
  if (!orders.length) {
    console.log("⚠️ Không có đơn hàng nào để insert!");
    return;
  }

  const formatted = orders.map((o) => ({
    ...o,
    packages: JSON.stringify(o.packages ?? []),
  }));

  // Giả sử mỗi đơn có ~25 field, => 65,534 / 25 ≈ 2600 đơn max mỗi batch
  // Để an toàn, chia nhỏ batch còn 500–1000 đơn
  const CHUNK_SIZE = 500;

  console.log(`Tổng ${formatted.length} đơn hàng → chia thành ~${Math.ceil(formatted.length / CHUNK_SIZE)} batch.`);

  let totalInserted = 0;

  for (let i = 0; i < formatted.length; i += CHUNK_SIZE) {
    const chunk = formatted.slice(i, i + CHUNK_SIZE);

    try {
      await sql`
        INSERT INTO orders ${sql(chunk)}
        ON CONFLICT (order_id) DO NOTHING;
      `;
      totalInserted += chunk.length;
    } catch (err) {
      console.error(`Lỗi khi insert batch ${i / CHUNK_SIZE + 1}:`, err.message);
    }
  }

  console.log(`Tổng cộng đã insert ${totalInserted} đơn hàng vào Supabase!`);
}
