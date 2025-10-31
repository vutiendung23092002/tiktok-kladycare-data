/**
 * So sánh diff giữa dữ liệu mới (từ API) và dữ liệu cũ (từ Supabase)
 * @param {Array<Object>} newRecords - Dữ liệu mới (đã có id & hash)
 * @param {Array<Object>|Object} oldRecords - Dữ liệu cũ (array hoặc map {id: hash})
 * @param {string} idKey - Tên field định danh (ví dụ: 'order_id' hoặc 'item_id')
 * @param {string} hashKey - Tên field hash (ví dụ: 'hash_order' hoặc 'hash_item')
 * @returns {{ toInsert: Object[], toUpdate: Object[], toDelete: string[] }}
 */
export function diffRecords(newRecords, oldRecords, idKey, hashKey) {
  // Nếu oldRecords là array thì convert sang object để lookup nhanh
  const oldMap = Array.isArray(oldRecords)
    ? Object.fromEntries(oldRecords.map((r) => [r[idKey], r[hashKey]]))
    : oldRecords;

  const toInsert = [];
  const toUpdate = [];
  const seenIds = new Set();

  for (const record of newRecords) {
    const id = record[idKey];
    const newHash = record[hashKey];
    const oldHash = oldMap[id];

    seenIds.add(id);

    // Nếu chưa có trong Supabase → thêm mới
    if (!oldHash) {
      toInsert.push(record);
    }
    // Nếu có nhưng hash khác → update
    else if (oldHash !== newHash) {
      toUpdate.push(record);
    }
  }

  const toUpsert = [...toInsert, ...toUpdate];

  console.log(`Diff summary (${idKey}):
  - Thêm mới: ${toInsert.length}
  - Cập nhật: ${toUpdate.length}`);

  return { toUpsert,toInsert,toUpdate };
}
