package com.order.order_service.dto;

import com.order.order_service.Model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private UUID orderId;
    private UUID userId;
    private String orderNumber; // Nếu bạn có sinh mã
    private Double totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private String phone;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
