import { selectOrdersByDate } from "./src/services/supabase.service.js";
import fs from "fs/promises";
// import { syncOrdersToLarkBase } from "./src/services/lark.service.js";

(async () => {
  const orders = await selectOrdersByDate("2025/10/01 00:00:00", "2025/10/31 23:59:59");
  await fs.writeFile(
    "./src/data/all_order_details.json",
    JSON.stringify(orders, null, 2),
    "utf-8"
  );

  // if (orders.length > 0) await syncOrdersToLarkBase(orders);
})();
