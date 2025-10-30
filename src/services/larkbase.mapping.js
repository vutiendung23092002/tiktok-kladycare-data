// src/services/larkbase.mapping.js
export const ORDER_FIELD_MAP = {
  order_id: "Mã đơn hàng",
  cancel_order_sla_time: "Thời hạn tự huỷ đơn",
  cancellation_initiator: "Người khởi tạo huỷ",
  create_time: "Ngày tạo đơn",
  packages: "Gói hàng",
  sub_total: "Tổng phụ", // = Tổng giá gốc sản phẩm - Giảm giá từ người bán - Giảm giá từ Sàn
  shipping_fee: "Phí vận chuyển",
  seller_discount: "Giảm giá người bán",
  platform_discount: "Giảm giá sàn",
  total_amount: "Tổng tiền",  // = Tổng phụ + phí vận chuyển + thuế
  original_total_product_price: "Tổng giá gốc sản phẩm",
  tax: "Thuế",
  product_tax: "Thuế sản phẩm",
  handling_fee: "Phí xử lý", // Phí cho người mua 
  status: "Trạng thái",
  fulfillment_type: "Nơi xử lý đơn",
  paid_time: "Thời gian thanh toán",
  cancel_reason: "Lý do huỷ",
  cancel_time: "Thời gian huỷ",
  cpf: "Mã CPF (nếu có)", // Không quan trọng ( dành cho thị trường brazil)
  delivery_due_time: "Thời hạn giao hàng", // đa phần là null - không quan trọng
  delivery_time: "Thời gian giao hàng", // Chỉ những đơn đã giao mới có
  commerce_platform: "Nền tảng thương mại", // Không quan trọng (dành cho thị trường indonesia)
  hash: "hash"
};
