import sql from "./supabase.connect.js";
import { writeSyncLog } from "../utils/writelog.js";

//order table

/**
 * Đảm bảo bảng "orders" tồn tại trong Supabase.
 * Nếu chưa có thì tự động tạo mới.
 * 
 * @returns {Promise<void>}
 */
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


/**
 * Thêm mới danh sách đơn hàng vào bảng "orders".
 * Nếu đơn đã tồn tại (trùng order_id), sẽ bỏ qua (DO NOTHING).
 * 
 * @param {Array<Object>} orders - Danh sách đơn hàng cần insert.
 * @returns {Promise<void>}
 */
export async function insertOrders(orders) {
    if (!orders.length) {
        console.log("⚠️ Không có đơn hàng nào để insert!");
        return;
    }

    const formatted = orders.map((o) => ({
        ...o,
        cancel_order_sla_time: o.cancel_order_sla_time?.toString() || "",
        create_time: o.create_time?.toString() || "",
        paid_time: o.paid_time?.toString() || "",
        cancel_time: o.cancel_time?.toString() || "",
        delivery_due_time: o.delivery_due_time?.toString() || "",
        delivery_time: o.delivery_time?.toString() || "",
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

/**
 * Lấy danh sách order_id + hash trong khoảng thời gian
 * @param {string} startDate - ví dụ: "2025/01/01 00:00:00"
 * @param {string} endDate - ví dụ: "2025/03/31 23:59:59"
 * @returns {Promise<Array<{order_id: string, hash: string}>>}
 */
export async function selectOrdersHashByDate(startDate, endDate) {
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

/**
 * Lấy danh sách orders trong khoảng thời gian
 * @param {string} startDate - ví dụ: "2025/01/01 00:00:00"
 * @param {string} endDate - ví dụ: "2025/03/31 23:59:59"
 * @returns {Promise<Array<{order_id: string, hash: string}>>}
 */
export async function selectOrdersByDate(startDate, endDate) {
    console.log(`Lấy orders từ ${startDate} → ${endDate}`);

    try {
        const rows = await sql`
      SELECT *
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

/**
 * Upsert dữ liệu đơn hàng.
 * Nếu order_id đã tồn tại → cập nhật dữ liệu.
 * Nếu chưa có → thêm mới.
 * 
 * @param {Array<Object>} orders - Danh sách đơn hàng cần upsert.
 * @returns {Promise<void>}
 */
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

//order_item table//
/**
 * Đảm bảo bảng "order_items" tồn tại trong Supabase.
 * Nếu chưa có thì tự động tạo mới.
 * 
 * @returns {Promise<void>}
 */
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

/**
 * Insert danh sách order items vào Supabase.
 * Nếu item đã tồn tại (trùng item_id) thì bỏ qua.
 * 
 * @param {Array<Object>} items - Danh sách item cần insert.
 * @returns {Promise<void>}
 */
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

/**
  * Lấy danh sách order_id + hash trong khoảng thời gian
 * @param {string} startDate - ví dụ: "2025/01/01 00:00:00"
 * @param {string} endDate - ví dụ: "2025/03/31 23:59:59"
 * @returns {Promise<Array<{ item_id: string, hash_item: string }>>}
 */
export async function selectOrderItemsHashByDate(startDate, endDate) {
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

/**
  * Lấy danh sách order item trong khoảng thời gian
 * @param {string} startDate - ví dụ: "2025/01/01 00:00:00"
 * @param {string} endDate - ví dụ: "2025/03/31 23:59:59"
 * @returns {Promise<Array<{ item_id: string, hash_item: string }>>}
 */
export async function selectOrderItemsByDate(startDate, endDate) {
    console.log(`Lấy order items từ ${startDate} → ${endDate}`);

    try {
        const rows = await sql`
        SELECT *
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

/**
 * Upsert danh sách order_items vào Supabase.
 * Nếu item_id tồn tại thì cập nhật, nếu chưa thì thêm mới.
 * 
 * @param {Array<Object>} items - Danh sách order items cần upsert.
 * @returns {Promise<void>}
 */
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
