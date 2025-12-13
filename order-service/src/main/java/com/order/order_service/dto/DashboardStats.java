package com.order.order_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class DashboardStats {
    private Double totalRevenue; // Tổng doanh thu (chỉ tính đơn thành công)
    private Long totalOrders;    // Tổng số đơn
    private Long pendingOrders;  // Đơn chờ xử lý (cần Admin action)
    private Long processingOrders;
    private Long completedOrders;
    private Long cancelledOrders;

    // Thống kê doanh thu theo tháng (để vẽ biểu đồ)
    // Key: Tháng (1-12), Value: Doanh thu
    private Map<Integer, Double> revenueByMonth;
}
