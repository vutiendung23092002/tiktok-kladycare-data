// src/services/larkbase.mapping.js

//Orders
export const ORDER_FIELD_MAP = {
  order_id: "Mã đơn hàng",
  create_time: "Ngày tạo đơn",
  paid_time: "Thời gian thanh toán",
  status: "Trạng thái",
  total_amount: "Tổng tiền",  // = Tổng phụ + phí vận chuyển + thuế
  sub_total: "Tổng tiền tạm tính", // = Tổng giá gốc sản phẩm - Giảm giá từ người bán - Giảm giá từ Sàn
  platform_discount: "Giảm giá sàn",
  seller_discount: "Giảm giá người bán",
  original_total_product_price: "Tổng giá gốc sản phẩm",
  shipping_fee: "Phí vận chuyển",
  cancel_reason: "Lý do huỷ",
  tax: "Thuế",
  product_tax: "Thuế sản phẩm",
  handling_fee: "Phí xử lý", // Phí cho người mua 
  fulfillment_type: "Nơi xử lý đơn",
  cancel_time: "Thời gian huỷ",
  cpf: "Mã CPF (nếu có)", // Không quan trọng ( dành cho thị trường brazil)
  delivery_due_time: "Thời hạn giao hàng", // đa phần là null - không quan trọng
  delivery_time: "Thời gian giao hàng", // Chỉ những đơn đã giao mới có
  commerce_platform: "Nền tảng thương mại", // Không quan trọng (dành cho thị trường indonesia)
  cancel_order_sla_time: "Thời hạn tự huỷ đơn",
  cancellation_initiator: "Người khởi tạo huỷ",
  packages: "ID gói hàng",
  hash: "hash"
};

// Order Items
export const ORDER_ITEM_FIELD_MAP = {
  item_id: "Id",
  order_id: "Mã đơn hàng",
  create_time: "Ngày tạo đơn",
  seller_sku: "Mã sản phẩm",
  product_name: "Tên sản phẩm",
  is_gift: "Loại Item",
  status: "Trạng thái",
  gift_retail_price: "Giá bán lẻ của quà tặng", // Không quan trọng
  platform_discount: "Giảm giá sàn",
  seller_discount: "Giảm giá người bán",
  original_price: "Giá gốc",
  sale_price: "Giá bán sản phẩm", // = giá gốc - giảm giá
  hash: "hash",
};

/**
 * Gán type cho từng field
 * 1 = text, 2 = number, 5 = date
 */
export const LARK_FIELD_TYPE_MAP = {
  order_id: 1,
  item_id: 1,
  cancel_order_sla_time: 5,
  cancellation_initiator: 1,
  create_time: 5,
  packages: 1,
  sub_total: 2,
  shipping_fee: 2,
  seller_discount: 2,
  platform_discount: 2,
  total_amount: 2,
  original_total_product_price: 2,
  tax: 2,
  product_tax: 2,
  handling_fee: 2,
  status: 1,
  fulfillment_type: 1,
  paid_time: 5,
  cancel_reason: 1,
  cancel_time: 5,
  cpf: 1,
  delivery_due_time: 5,
  delivery_time: 5,
  commerce_platform: 1,
  seller_sku: 1,
  product_name: 1,
  is_gift: 1,
  gift_retail_price: 2,
  original_price: 2,
  sale_price: 2, 
  hash: 1,
};