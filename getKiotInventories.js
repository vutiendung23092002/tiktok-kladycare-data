import axios from "axios";
import { config } from "./src/config/env.config.js";
import fs from "fs/promises";

function formatKiotProductData(product) {
  const findPrice = (name) => {
    const pb = product.priceBooks?.find(
      (b) => b.priceBookName?.toLowerCase() === name.toLowerCase()
    );
    return pb ? pb.price : null;
  };

  const inv = product.inventories?.[0] || {};

  const mapped = {
    code: product.code,
    name: product.name,
    cost: inv.cost ?? null,
  };
  return mapped;
}


async function getKiotVietToken() {
    console.log("[KIOT_AUTH] Đang gọi API lấy token KiotViet...");

    try {
        const res = await axios.post(
            config.kiotviet.endpointKiot_auth,
            new URLSearchParams({
                client_id: config.kiotviet.clientId,
                client_secret: config.kiotviet.clientSecret,
                grant_type: "client_credentials",
                scopes: "PublicApi.Access",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        console.log("[KIOT_AUTH] Lấy token KiotViet thành công!");
        return res.data.access_token;
    } catch (err) {
        console.log("ERROR", `[KIOT_AUTH]-kiotviet.auth.js - Lỗi khi lấy token KiotViet: ${err.response?.data || err.message}`)
        throw err;
    }
}

async function getKiotVietProducts(token, currentItem = 0, pageSize = 100) {
    const baseUrl = `${config.kiotviet.endpointKiot_public}/Products`;
    const params = {
        currentItem,
        pageSize,
        orderBy: "id",
        includePricebook: true,
        includeInventory: true,
    };

    try {
        const res = await axios.get(baseUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Retailer: config.kiotviet.retailer,
            },
            params,
        });

        if (!res.data?.data) throw new Error("Response không hợp lệ");
        return res.data.data;
    } catch (err) {
        console.log("ERROR", `[KIOT_AUTH]-kiotviet.auth.js - Lỗi khi lấy sản phẩm: ${err.response?.data || err.message}`)
        throw err;
    }
}

async function getAllKiotProducts(pageSize = 100) {
    console.log("[KIOT] Bắt đầu lấy toàn bộ sản phẩm từ KiotViet...");

    let allProducts = [];
    let currentItem = 0;
    let hasMore = true;
    let token = await getKiotVietToken();

    while (hasMore) {
        const batch = await getKiotVietProducts(token, currentItem, pageSize);

        if (!batch.length) break;

        const mappedBatch = batch.map(formatKiotProductData);
        allProducts.push(...mappedBatch);

        hasMore = batch.length === pageSize;
        currentItem += pageSize;
    }

    console.log(`[KIOT] Hoàn tất! Tổng cộng ${allProducts.length} sản phẩm.`);
    return allProducts;
}

(async () => {
    const products = await getAllKiotProducts();

    // Lưu JSON kết quả
    await fs.writeFile(
        "./src/data/1_kiot_inventories.json",
        JSON.stringify(products, null, 2),
        "utf-8"
    );

    console.log(products);
})();