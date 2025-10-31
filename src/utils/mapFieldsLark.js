import { ORDER_FIELD_MAP, LARK_FIELD_TYPE_MAP } from "../services/larkbase.mapping.js";

/** Convert value theo type field */
function normalizeFieldValue(key, value) {
  const type = LARK_FIELD_TYPE_MAP[key];
  if (value === null || value === undefined || value === "") return null;

  switch (type) {
    case 2:
      return isNaN(value) ? null : Number(value);

    case 5:
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.getTime(); // trả về timestamp ms vì lark dùng timestamp
      } catch {
        return null;
      }
      return null;

    default:
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
  }
}

/** Map dữ liệu sang format Lark (đa năng) */
export function mapFieldsToLark(item, fieldMap = ORDER_FIELD_MAP) {
  const fields = {};
  for (const [key, label] of Object.entries(fieldMap)) {
    if (item[key] !== undefined && item[key] !== null) {
      fields[label] = normalizeFieldValue(key, item[key]);
    }
  }
  return { fields };
}

/**
 * Lấy danh sách { id, hash } từ record LarkBase
 * @param {Array<object>} items - danh sách record trả về từ API
 * @returns {Array<{id: string, hash: string, record_id: string}>}
 */
// export function extractLarkIdHash(items) {
//   return items.map((rec) => {
//     const f = rec.fields || {};
//     const idField = f["Mã đơn hàng"];
//     const hashField = f["hash"];

//     const id =
//       Array.isArray(idField) && idField[0]?.text
//         ? idField[0].text
//         : typeof idField === "string"
//         ? idField
//         : null;

//     const hash =
//       Array.isArray(hashField) && hashField[0]?.text
//         ? hashField[0].text
//         : typeof hashField === "string"
//         ? hashField
//         : null;

//     return {
//       record_id: rec.record_id,
//       id,
//       hash,
//     };
//   }).filter((r) => r.id && r.hash); // chỉ giữ record có đủ 2 trường
// }

/**
 * Lấy danh sách { id, hash } từ record LarkBase
 * @param {Array<object>} items - danh sách record trả về từ API
 * @param {string} idLabel - Tên cột ID trong LarkBase (ví dụ: "Mã đơn hàng" hoặc "Id")
 * @returns {Array<{id: string, hash: string, record_id: string}>}
 */
export function extractLarkIdHash(items, idLabel = "Mã đơn hàng") {
  return items
    .map((rec) => {
      const f = rec.fields || {};
      const idField = f[idLabel];
      const hashField = f["hash"];

      const id =
        Array.isArray(idField) && idField[0]?.text
          ? idField[0].text
          : typeof idField === "string"
          ? idField
          : null;

      const hash =
        Array.isArray(hashField) && hashField[0]?.text
          ? hashField[0].text
          : typeof hashField === "string"
          ? hashField
          : null;

      return {
        record_id: rec.record_id,
        id: id ? String(id).trim() : null,
        hash: hash ? String(hash).trim() : null,
      };
    })
    .filter((r) => r.id && r.hash);
}
