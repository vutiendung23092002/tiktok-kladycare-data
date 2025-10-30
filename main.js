import { syncTiktokToSupabase } from "./src/sync/syncTiktokToSupabase.js";
import { writeSyncLog } from "./src/utils/writelog.js";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
    const startDate = "2025/10/01 00:00:00";
    const endDate = "2025/10/31 23:59:59";

    console.log("Bắt đầu tiến trình đồng bộ liên tục...");

    while (true) {
        try {
            console.time("Thời gian đồng bộ");
            await syncTiktokToSupabase(startDate, endDate);
            console.timeEnd("Thời gian đồng bộ");
            writeSyncLog("SUCCESS", "Đồng bộ hoàn tất!");
        } catch (err) {
            writeSyncLog("ERROR", `[main.js] Lỗi đồng bộ: ${err.message}`);
        }

        await sleep(1000);
    }
})();
