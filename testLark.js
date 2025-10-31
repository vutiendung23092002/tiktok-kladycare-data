import { client } from "./src/services/lark.connect.js";
import { config } from "./src/config/env.config.js";
import { syncTiktokOrdersToLarkBase, syncTiktokOrderItemsToLarkBase } from "./src/sync/syncSupabaseToLark.js"

(async () => {
  const BASE_ID = config.lark.base_id;
  const TABLE_NAME = "Tiktok Order Items (T10)";
  const startDate = "2025/10/01 00:00:00";
  const endDate = "2025/10/31 23:59:59";
  await syncTiktokOrderItemsToLarkBase(client, BASE_ID, TABLE_NAME, startDate, endDate);
})();