import { utcToVNTime } from "./VNtimeToUTCTimestamp.js";
import { generateHash } from "./generateHash.js";

/**
 * Chuẩn hoá 1 đơn hàng TikTok theo yêu cầu
 * @param {Object} order - object trả về từ TikTok API
 * @returns {Object} formattedOrder - chỉ chứa field cần thiết
 */
export function formatTikTokOrder(order) {
  if (!order) return null;

  const formatted = {
    order_id: order.id || "",
    cancel_order_sla_time: order.cancel_order_sla_time ? utcToVNTime(order.cancel_order_sla_time) : null,
    cancellation_initiator: order.cancellation_initiator || "",
    create_time: order.create_time ? utcToVNTime(order.create_time) : null,
    packages: order.packages || [],
    sub_total: order.payment?.sub_total ?? 0,
    shipping_fee: order.payment?.shipping_fee ?? 0,
    seller_discount: order.payment?.seller_discount ?? 0,
    platform_discount: order.payment?.platform_discount ?? 0,
    total_amount: order.payment?.total_amount ?? 0,
    original_total_product_price: order.payment?.original_total_product_price ?? 0,
    tax: order.payment?.tax ?? 0,
    product_tax: order.payment?.product_tax ?? 0,
    handling_fee: order.payment?.handling_fee ?? 0,
    status: order.order_status || order.status || "",
    fulfillment_type: order.fulfillment_type || "",
    paid_time: order.paid_time ? utcToVNTime(order.paid_time) : null,
    cancel_reason: order.cancel_reason || "",
    cancel_time: order.cancel_time ? utcToVNTime(order.cancel_time) : null,
    cpf: order.cpf || "",
    delivery_due_time: order.delivery_due_time ? utcToVNTime(order.delivery_due_time) : null,
    delivery_time: order.delivery_time ? utcToVNTime(order.delivery_time) : null,
    commerce_platform: order.commerce_platform || "",
  };

  // Tạo hash_order (bỏ qua order_id)
  formatted.hash = generateHash(formatted, ["order_id"]);

  return formatted;
}

/**
 * Chuẩn hoá từng item trong đơn hàng TikTok
 * @param {Object} order - Object đơn hàng trả về từ API TikTok
 * @returns {Array<Object>} Danh sách item đã format
 */
export function formatTikTokOrderItem(order) {
  if (!order || !Array.isArray(order.line_items)) return [];

  return order.line_items.map((item) => {
    const formattedItem = {
      item_id: item.id || "",
      order_id: order.id || "",
      create_time: order.create_time ? utcToVNTime(order.create_time) : null,
      is_gift: !!item.is_gift,
      status: item.display_status || "",
      gift_retail_price: Number(item.gift_retail_price || 0),
      platform_discount: Number(item.platform_discount || 0),
      original_price: Number(item.original_price || 0),
      seller_discount: Number(item.seller_discount || 0),
      sale_price: Number(item.sale_price || 0),
      product_name: item.product_name || "",
      seller_sku: item.seller_sku || "",
    };

    // Tạo hash_item, bỏ item_id để hash chỉ phản ánh nội dung
    formattedItem.hash = generateHash(formattedItem, ["item_id"]);

    return formattedItem;
  });
}
