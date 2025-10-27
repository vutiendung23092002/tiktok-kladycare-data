import { utcToVNTime } from "./VNtimeToUTCTimestamp.js";

/**
 * 🧾 Chuẩn hoá 1 đơn hàng TikTok theo yêu cầu
 * @param {Object} order - object trả về từ TikTok API
 * @returns {Object} formattedOrder - chỉ chứa field cần thiết
 */
export function formatTikTokOrder(order) {
    if (!order) return null;

    return {
        id: order.id || order.order_id || "",
        cancel_order_sla_time: order.cancel_order_sla_time
            ? utcToVNTime(order.cancel_order_sla_time)
            : null,
        cancellation_initiator: order.cancellation_initiator || "",
        create_time: order.create_time ? utcToVNTime(order.create_time) : null,
        packages: order.packages || [],
        sub_total: order.payment_info?.sub_total ?? 0,
        shipping_fee: order.payment_info?.shipping_fee ?? 0,
        seller_discount: order.payment_info?.seller_discount ?? 0,
        platform_discount: order.payment_info?.platform_discount ?? 0,
        total_amount: order.payment_info?.total_amount ?? 0,
        original_total_product_price:
            order.payment_info?.original_total_product_price ?? 0,
        tax: order.payment_info?.tax ?? 0,
        product_tax: order.payment_info?.product_tax ?? 0,
        handling_fee: order.payment_info?.handling_fee ?? 0,
        status: order.order_status || order.status || "",
        fulfillment_type: order.fulfillment_type || "",
        paid_time: order.paid_time ? utcToVNTime(order.paid_time) : null,
        cancel_reason: order.cancel_reason || "",
        cancel_time: order.cancel_time ? utcToVNTime(order.cancel_time) : null,
        cpf: order.cpf || "",
        line_items: order.line_items || [],
        delivery_due_time: order.delivery_due_time
            ? utcToVNTime(order.delivery_due_time)
            : null,
        delivery_time: order.delivery_time
            ? utcToVNTime(order.delivery_time)
            : null,
        commerce_platform: order.commerce_platform || "",
    };
}
