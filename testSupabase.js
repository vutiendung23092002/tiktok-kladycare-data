import { selectOrdersByDate, selectOrderItemsByDate } from "./src/services/supabase.service.js";
import fs from "fs/promises";
import { addCostToOrderItems } from "./src/utils/addCostToOrderItems.js";
// import { syncOrdersToLarkBase } from "./src/services/lark.service.js";


  (async () => {
    const orderItems = await selectOrderItemsByDate("2025/07/01 00:00:00", "2025/09/30 23:59:59");

    const inve = JSON.parse(await fs.readFile("./src/data/1_kiot_inventories.json", "utf-8"));
    const orderItemsWithCost = addCostToOrderItems(orderItems, inve);

    // console.log(orderItemsWithCost);

    await fs.writeFile(
        "./src/data/supabaseOrderItem.json",
        JSON.stringify(orderItemsWithCost, null, 2),
        "utf-8"
    );

    // if (orders.length > 0) await syncOrdersToLarkBase(orders);
  })();
