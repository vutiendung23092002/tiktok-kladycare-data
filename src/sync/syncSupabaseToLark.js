import {
    getListTable,
    ensureLarkBaseOrderTable,
    createLarkRecords,
    searchLarkRecords,
    updateLarkRecords,
} from "../services/lark.service.js";
import { selectOrdersByDate, selectOrderItemsByDate } from "../services/supabase.service.js";
import { ORDER_FIELD_MAP, ORDER_ITEM_FIELD_MAP, LARK_FIELD_TYPE_MAP } from "../services/larkbase.mapping.js";
import { mapFieldsToLark, extractLarkIdHash } from "../utils/mapFieldsLark.js";
import { diffRecords } from "./syncDiff.js";

/**
 * Đồng bộ đơn hàng từ Supabase lên LarkBase
 * @param {object} client - Lark client instance
 * @param {string} baseId - Lark Base ID
 * @param {string} tableName - Tên bảng Lark Base
 * @param {string} startDate - Ngày bắt đầu (YYYY/MM/DD HH:mm:ss)
 * @param {string} endDate - Ngày kết thúc (YYYY/MM/DD HH:mm:ss)
 */
export async function syncTiktokOrdersToLarkBase(client, baseId, tableName, startDate, endDate) {

    console.log("Lấy dữ liệu đơn hàng từ Supabase...");
    const supabaseRecords = await selectOrdersByDate(startDate, endDate);
    const orders = supabaseRecords || [];

    console.log(`Tổng số đơn hàng lấy từ Supabase: ${orders.length}`);

    // Chuẩn hóa chỉ id + hash để so sánh diff
    const supabaseDataForDiff = orders.map((r) => ({
        id: String(r.order_id),
        hash: r.hash,
    }));

    //Kiểm tra bảng trên LarkBase
    const listTb = await getListTable(client, baseId);
    const table = listTb.data?.items?.find((t) => t.name === tableName);
    let tableId;

    if (table) {
        console.log(`Bảng '${tableName}' đã tồn tại.`);
        tableId = table.table_id;
    } else {
        console.log(`Tạo bảng '${tableName}' mới...`);
        const fields = Object.entries(ORDER_FIELD_MAP).map(([key, label]) => ({
            field_name: label,
            type: LARK_FIELD_TYPE_MAP[key] || 1,
        }));
        tableId = await ensureLarkBaseOrderTable(client, baseId, tableName, fields);
    }

    //Lấy dữ liệu hiện có từ LarkBase
    console.log("Lấy dữ liệu hiện có trên LarkBase...");
    const recordOrders = await searchLarkRecords(client, baseId, tableId, 1000);
    console.log(`Đã lấy ${recordOrders.length} bản ghi hiện có từ LarkBase`);

    const simplifiedRecords = extractLarkIdHash(recordOrders, "Mã đơn hàng")
        .map((r) => ({ ...r, id: String(r.id) }));

    console.log(`Dữ liệu hợp lệ để diff: ${simplifiedRecords.length}`);

    //So sánh diff (id + hash)
    console.log("So sánh diff giữa Supabase và LarkBase...");
    const { toUpsert } = diffRecords(supabaseDataForDiff, simplifiedRecords, "id", "hash");

    //Phân loại create/update theo record_id có sẵn
    const larkIdMap = Object.fromEntries(
        simplifiedRecords.map((r) => [r.id, r.record_id])
    );

    const toCreate = orders
        .filter((o) =>
            toUpsert.some(
                (u) => String(u.id) === String(o.order_id) && !larkIdMap[String(o.order_id)]
            )
        )
        .map((o) => mapFieldsToLark(o));

    const toUpdate = orders
        .filter((o) =>
            toUpsert.some(
                (u) => String(u.id) === String(o.order_id) && larkIdMap[String(o.order_id)]
            )
        )
        .map((o) => ({
            record_id: larkIdMap[String(o.order_id)],
            fields: mapFieldsToLark(o).fields,
        }));

    console.log(`Tạo mới: ${toCreate.length}`);
    console.log(`Cập nhật: ${toUpdate.length}`);

    // Gửi song song lên LarkBase
    await Promise.all([
        toCreate.length ? createLarkRecords(client, baseId, tableId, toCreate) : Promise.resolve(),
        toUpdate.length ? updateLarkRecords(client, baseId, tableId, toUpdate) : Promise.resolve(),
    ]);
}


/**
 * Đồng bộ items đơn hàng từ Supabase lên LarkBase
 * @param {object} client - Lark client instance
 * @param {string} baseId - Lark Base ID
 * @param {string} tableName - Tên bảng Lark Base
 * @param {string} startDate - Ngày bắt đầu (YYYY/MM/DD HH:mm:ss)
 * @param {string} endDate - Ngày kết thúc (YYYY/MM/DD HH:mm:ss)
 */
export async function syncTiktokOrderItemsToLarkBase(client, baseId, tableName, startDate, endDate) {

    console.log("Lấy dữ liệu đơn hàng từ Supabase...");
    const supabaseRecords = await selectOrderItemsByDate(startDate, endDate);

    // await fs.writeFile(
    //     "./src/data/supabaseOrderItem.json",
    //     JSON.stringify(supabaseRecords, null, 2),
    //     "utf-8"
    // );

    const orderItems = supabaseRecords || [];

    console.log(`Tổng số đơn hàng lấy từ Supabase: ${orderItems.length}`);

    // Chuẩn hóa chỉ id + hash để so sánh diff
    const supabaseDataForDiff = orderItems.map((r) => ({
        id: String(r.item_id),
        hash: r.hash,
    }));

    //Kiểm tra bảng trên LarkBase
    const listTb = await getListTable(client, baseId);
    const table = listTb.data?.items?.find((t) => t.name === tableName);
    let tableId;

    if (table) {
        console.log(`Bảng '${tableName}' đã tồn tại.`);
        tableId = table.table_id;
    } else {
        console.log(`Tạo bảng '${tableName}' mới...`);
        const fields = Object.entries(ORDER_ITEM_FIELD_MAP).map(([key, label]) => ({
            field_name: label,
            type: LARK_FIELD_TYPE_MAP[key] || 1,
        }));
        tableId = await ensureLarkBaseOrderTable(client, baseId, tableName, fields);
    }

    //Lấy dữ liệu hiện có từ LarkBase
    console.log("Lấy dữ liệu hiện có trên LarkBase...");
    const recordOrderItems = await searchLarkRecords(client, baseId, tableId, 1000);
    console.log(`Đã lấy ${recordOrderItems.length} bản ghi hiện có từ LarkBase`);

    const simplifiedRecords = extractLarkIdHash(recordOrderItems, "Id")
        .map((r) => ({ ...r, id: String(r.id) }));

    console.log(`Dữ liệu hợp lệ để diff: ${simplifiedRecords.length}`);

    //So sánh diff (id + hash)
    console.log("So sánh diff giữa Supabase và LarkBase...");
    const { toUpsert } = diffRecords(supabaseDataForDiff, simplifiedRecords, "id", "hash");


    // Phân loại create/update theo record_id có sẵn
    const larkIdMap = Object.fromEntries(
        simplifiedRecords.map((r) => [String(r.id).trim(), r.record_id])
    );

    const toCreate = orderItems
        .filter((o) =>
            toUpsert.some(
                (u) => String(u.id) === String(o.item_id) && !larkIdMap[String(o.item_id)]
            )
        )
        .map((o) => mapFieldsToLark(o, ORDER_ITEM_FIELD_MAP));


    const toUpdate = orderItems
        .filter((o) =>
            toUpsert.some(
                (u) => String(u.id) === String(o.item_id) && larkIdMap[String(o.item_id)]
            )
        )
        .map((o) => ({
            record_id: larkIdMap[String(o.item_id)],
            fields: mapFieldsToLark(o, ORDER_ITEM_FIELD_MAP).fields,
        }));

    console.log(`Tạo mới: ${toCreate.length}`);
    console.log(`Cập nhật: ${toUpdate.length}`);

    // Gửi song song lên LarkBase
    await Promise.all([
        toCreate.length ? createLarkRecords(client, baseId, tableId, toCreate) : Promise.resolve(),
        toUpdate.length ? updateLarkRecords(client, baseId, tableId, toUpdate) : Promise.resolve(),
    ]);
}
