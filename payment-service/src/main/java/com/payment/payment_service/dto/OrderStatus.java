package com.payment.payment_service.dto;

public enum OrderStatus {
    PENDING,      // Đơn hàng mới tạo, chờ xác nhận
    CONFIRMED,    // Đã xác nhận thanh toán
    PROCESSING,   // Đang xử lý/đóng gói
    SHIPPED,      // Đã giao cho đơn vị vận chuyển
    DELIVERED,    // Đã giao thành công
    CANCELLED     // Đã hủy
}
