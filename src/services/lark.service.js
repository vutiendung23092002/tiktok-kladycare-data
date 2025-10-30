import { writeSyncLog } from "../utils/writelog.js";
import { ORDER_FIELD_MAP } from "./larkbase.mapping.js";

export async function ensureLarkBaseOrderTable(client, baseId, tableName) {

    // Lấy danh sách bảng
    let list;
    try {
        list = await client.bitable.appTable.list({
            path: { app_token: baseId },
            params: { page_size: 100 },
        });

        console.log(list.data?.items);
    } catch (e) {
        console.error("❌ Lỗi Lark API:", e.response?.data || e);
        return null;
    }
    
    const table = list.data?.items?.find((t) => t.name === tableName);

    if (table) {
        writeSyncLog("INFO", `Bảng '${tableName}' đã tồn tại.`);
        return table.table_id;
    }

    // Chuẩn bị field mapping
    const fields = Object.entries(ORDER_FIELD_MAP).map(([key, label]) => ({
        field_name: key,
        type: 2,
    }));

    console.log(fields);

    // Tạo bảng mới
    let result;
    await client.bitable.appTable.create({
        path: { app_token: baseId },
        data: {
            table: {
                name: tableName,
                default_view_name: 'Grid',
                fields,
            },
        },
    }).then(res => {
        result = res;
        console.log(res);
    }).catch(e => {
        console.error(JSON.stringify(e.response.data, null, 4));
    });;

    return result.data.table_id;
}