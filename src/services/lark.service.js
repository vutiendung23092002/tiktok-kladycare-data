import { writeSyncLog } from "../utils/writelog.js";
import { chunkArray } from "../utils/chunkArray.js"

/** Lấy danh sách bảng trong Base */
export async function getListTable(client, baseId) {
  try {
    const res = await client.bitable.appTable.list({
      path: { app_token: baseId },
      params: { page_size: 100 },
    });
    return res;
  } catch (e) {
    console.error("Lỗi Lark API:", e.response?.data || e);
    return null;
  }
}

/** Tạo bảng mới nếu chưa có */
export async function ensureLarkBaseOrderTable(client, baseId, tableName, fields) {
  try {
    const res = await client.bitable.appTable.create({
      path: { app_token: baseId },
      data: { table: { name: tableName, default_view_name: "Grid", fields } },
    });
    if (!res?.data?.table_id) throw new Error("Không nhận được table_id");
    writeSyncLog("SUCCESS", `Đã tạo bảng '${tableName}' (ID: ${res.data.table_id})`);
    return res.data.table_id;
  } catch (err) {
    const errMsg = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
    writeSyncLog("ERROR", `Lỗi tạo bảng '${tableName}': ${errMsg}`);
    throw err;
  }
}

// Search toàn bộ bản ghi trong bảng
export async function searchLarkRecords(client, baseId, tableId, pageSize = 500) {
  const records = [];

  for await (const page of await client.bitable.appTableRecord.searchWithIterator({
    path: {
      app_token: baseId,
      table_id: tableId,
    },
    params: {
      user_id_type: 'open_id',
      page_size: pageSize,
    },
  })) {
    // page.items là list record của mỗi trang
    if (page.items && page.items.length > 0) {
      records.push(...page.items);
    }
  }
  return records;
}


/** thêm nhiều bản ghi mới */
export async function createLarkRecords(client, baseId, tableId, listField) {
  const chunks = chunkArray(listField, 1000);
  let total = 0;

  console.log(`Tổng ${listField.length} bản ghi → chia thành ${chunks.length} batch`);

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    console.log(`Gửi batch [create] ${i + 1}/${chunks.length} (${batch.length} bản ghi)`);

    try {
      const res = await client.bitable.appTableRecord.batchCreate({
        path: { app_token: baseId, table_id: tableId },
        params: { ignore_consistency_check: true },
        data: { records: batch },
      });

      if (res?.data?.records?.length) {
        total += res.data.records.length;
      } else {
        console.warn(`Batch ${i + 1}: Không tạo được bản ghi nào`);
      }

      // delay nhẹ tránh rate limit (khuyến nghị)
      await new Promise((r) => setTimeout(r, 100));

    } catch (err) {
      const errMsg = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
      console.error(`Lỗi batch ${i + 1}: ${errMsg}`);
    }
  }

  writeSyncLog("SUCCESS", `Tổng cộng đã tạo mới ${total}/${listField.length} bản ghi`);
}

// Cập nhật nhiều bản ghi
export async function updateLarkRecords(client, baseId, tableId, listField) {
  const chunks = chunkArray(listField, 1000);
  let total = 0;

  console.log(`Tổng ${listField.length} bản ghi cần update → chia thành ${chunks.length} batch`);

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    console.log(`Gửi batch [update] ${i + 1}/${chunks.length} (${batch.length} bản ghi)`);
    try {
      const res = await client.bitable.appTableRecord.batchUpdate({
        path: { app_token: baseId, table_id: tableId },
        params: {
          ignore_consistency_check: true,
          user_id_type: "open_id",
        },
        data: {
          records: batch,
        },
      });

      if (res?.data?.records?.length) {
        total += res.data.records.length;
      } else {
        console.warn(`Batch ${i + 1}: Không có bản ghi nào được cập nhật`);
      }

      await new Promise((r) => setTimeout(r, 100)); // tránh rate limit

    } catch (err) {
      const errMsg = err.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : err.message;
      writeSyncLog("ERROR", `Lỗi batch ${i + 1} khi update: ${errMsg}`);
      console.error(`Batch ${i + 1} lỗi:`, errMsg);
    }
  }

  writeSyncLog("SUCCESS", `Tổng cộng đã update ${total}/${listField.length} bản ghi`);
}