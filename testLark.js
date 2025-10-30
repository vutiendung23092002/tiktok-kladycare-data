import { ensureLarkBaseOrderTable } from "./src/services/lark.service.js";
import { config  } from "./src/config/env.config.js";
import { client } from "./src/services/lark.connect.js"
import { getTenantAccessToken } from "./src/api/larkbase.auth.js"

const BASE_ID = config.lark.base_id;

(async () => {
  const tableId = await ensureLarkBaseOrderTable(client, BASE_ID, "Tiktok Orders (T1-T3)");
  console.log("Bảng ID:", tableId);
})();
