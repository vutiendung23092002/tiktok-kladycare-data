import { client } from "./src/services/lark.connect.js";
import { syncTiktokToSupabase } from "./src/sync/syncTiktokToSupabase.js";
import { syncTiktokOrdersToLarkBase, syncTiktokOrderItemsToLarkBase } from "./src/sync/syncSupabaseToLark.js"
import { writeSyncLog } from "./src/utils/writelog.js";
import { config } from "./src/config/env.config.js";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


async function startSyncTiktokToSupabase(startDate, endDate) {
  const LOOP_DELAY = 100;
  while (true) {
    try {
      console.time("Tiktok ➜ Supabase");
      await syncTiktokToSupabase(startDate, endDate);
      console.timeEnd("Tiktok ➜ Supabase");
      writeSyncLog("SUCCESS", "[Tiktok ➜ Supabase] Đồng bộ xong!");
    } catch (err) {
      writeSyncLog("ERROR", `[Tiktok ➜ Supabase] ${err.message}`);
    }
    await sleep(LOOP_DELAY);
  }
}

async function startSyncOrderSupabaseToLark(startDate, endDate, baseId, tableName) {
  const LOOP_DELAY = 100;
  while (true) {
    try {
      console.time("Order Supabase ➜ LarkBase");
      await syncTiktokOrdersToLarkBase(client, baseId, tableName, startDate, endDate);
      console.timeEnd("Order Supabase ➜ LarkBase");
      writeSyncLog("SUCCESS", "[Order Supabase ➜ LarkBase] Đồng bộ xong!");
    } catch (err) {
      writeSyncLog("ERROR", `[Order Supabase ➜ LarkBase] ${err.message}`);
    }
    await sleep(LOOP_DELAY);
  }
}

async function startSyncOrderItemsSupabaseToLark(startDate, endDate, baseId, tableName) {
  const LOOP_DELAY = 100;
  while (true) {
    try {
      console.time("Order Items Supabase ➜ LarkBase");
      await syncTiktokOrderItemsToLarkBase(client, baseId, tableName, startDate, endDate);
      console.timeEnd("Order Items Supabase ➜ LarkBase");
      writeSyncLog("SUCCESS", "[Order Items Supabase ➜ LarkBase] Đồng bộ xong!");
    } catch (err) {
      writeSyncLog("ERROR", `[Order Items Supabase  ➜ LarkBase] ${err.message}`);
    }
    await sleep(LOOP_DELAY);
  }
}

(async () => {
  const BASE_ID = config.lark.base_id;
  const startDate = "2025/10/01 00:00:00";
  const endDate = "2025/10/31 23:59:59";
  const TABLE_ORDER_NAME = "Tiktok Orders (T10)";
  const TABLE_ORDER_ITEMS_NAME = "Tintok Order Items (T10)";

  console.log("Bắt đầu tiến trình đồng bộ");

  // Chạy hai vòng loop song song, không đợi nhau
  await Promise.all([
    startSyncTiktokToSupabase(startDate, endDate),
    startSyncOrderSupabaseToLark(startDate, endDate, BASE_ID, TABLE_ORDER_NAME),
    startSyncOrderItemsSupabaseToLark(startDate, endDate, BASE_ID, TABLE_ORDER_ITEMS_NAME)
  ]);
})();
