/**
 * Gán cost (giá vốn) vào orderItems bằng cách so sánh gần đúng theo tên sản phẩm
 * và có trọng số theo ngữ cảnh.
 */
export function addCostToOrderItems(orderItems, inventories) {
  console.log("🧠 Bắt đầu đối chiếu cost theo tên sản phẩm (phiên bản thông minh)...");

  const normalizedInventories = inventories.map(inv => ({
    ...inv,
    normalizedName: normalizeText(inv.name),
  }));

  const result = orderItems.map(item => {
    const normalizedName = normalizeText(item.product_name || "");

    const bestMatch = findBestMatch(normalizedName, normalizedInventories, item.seller_sku);
    const cost = bestMatch?.cost ?? null;

    if (bestMatch && bestMatch.score >= 0.55) {
      console.log(`✅ Match: "${item.product_name}" ↔ "${bestMatch.name}" (score: ${bestMatch.score.toFixed(2)}, cost: ${cost})`);
    } else {
      console.log(`⚠️ Không match được: "${item.product_name}"`);
    }

    return { ...item, cost };
  });

  console.log(`🏁 Hoàn tất! ${result.filter(r => r.cost != null).length}/${orderItems.length} item có cost.`);
  return result;
}

/** Giữ dấu tiếng Việt, chỉ bỏ ký tự đặc biệt và normalize khoảng trắng */
function normalizeText(text) {
  return text
    .toUpperCase()
    .replace(/[^A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tìm inventory có tên gần giống nhất, có xét trọng số logic */
function findBestMatch(productName, inventories, sellerSku) {
  let bestMatch = null;
  let bestScore = 0;

  for (const inv of inventories) {
    let score = getSimilarity(productName, inv.normalizedName);

    // === Áp dụng trọng số thông minh ===
    const comboInProduct = productName.includes("COMBO");
    const comboInInventory = inv.normalizedName.includes("COMBO");

    if (comboInProduct && comboInInventory) score += 0.2;
    else if (comboInProduct !== comboInInventory) score -= 0.3;

    // kiểm tra số lượng (VD: “3 HỘP”, “10 VỈ”)
    const numberMatch = productName.match(/\b(\d+)\b/);
    if (numberMatch && inv.normalizedName.includes(numberMatch[1])) score += 0.1;

    // nếu product chứa mã sản phẩm (như B19, A25, C36)
    if (sellerSku && inv.normalizedName.includes(sellerSku.toUpperCase())) score += 0.05;

    // Clamp score trong khoảng [0,1]
    score = Math.max(0, Math.min(1, score));

    if (score > bestScore) {
      bestScore = score;
      bestMatch = inv;
    }
  }

  return bestMatch ? { ...bestMatch, score: bestScore } : null;
}

/** Đo độ tương đồng giữa 2 chuỗi bằng số lượng từ chung */
function getSimilarity(a, b) {
  if (!a || !b) return 0;
  const setA = new Set(a.split(" "));
  const setB = new Set(b.split(" "));
  const intersection = [...setA].filter(x => setB.has(x));
  return intersection.length / Math.max(setA.size, setB.size);
}
