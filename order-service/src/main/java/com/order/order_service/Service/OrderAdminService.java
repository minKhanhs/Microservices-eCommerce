package com.order.order_service.Service;

import com.order.order_service.Model.OrderStatus;
import com.order.order_service.Repo.OrderRepo;
import com.order.order_service.dto.DashboardStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderAdminService {
    private final OrderRepo orderRepository;

    public DashboardStats getDashboardStats() {
        Double revenue = orderRepository.calculateTotalRevenue();
        if (revenue == null) revenue = 0.0;

        return DashboardStats.builder()
                .totalRevenue(revenue)
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .processingOrders(orderRepository.countByStatus(OrderStatus.PROCESSING))
                .completedOrders(orderRepository.countByStatus(OrderStatus.DELIVERED))
                .cancelledOrders(orderRepository.countByStatus(OrderStatus.CANCELLED))
                .build();
    }

    // API lấy dữ liệu biểu đồ doanh thu
    // Lấy dữ liệu biểu đồ doanh thu theo ngày trong tháng
    public Map<Integer, Double> getDailyRevenueChart(int month, int year) {
        // 1. Lấy dữ liệu thô từ DB
        List<Object[]> results = orderRepository.findRevenueByDayInMonth(month, year);

        // 2. Tính số ngày trong tháng đó (28, 29, 30 hay 31 ngày)
        YearMonth yearMonthObject = YearMonth.of(year, month);
        int daysInMonth = yearMonthObject.lengthOfMonth();

        // 3. Khởi tạo Map full các ngày với giá trị 0.0
        // Dùng LinkedHashMap để giữ thứ tự từ ngày 1 -> ngày cuối
        Map<Integer, Double> revenueMap = new LinkedHashMap<>();
        for (int i = 1; i <= daysInMonth; i++) {
            revenueMap.put(i, 0.0);
        }

        // 4. Đổ dữ liệu thật vào Map
        for (Object[] row : results) {
            Integer day = (Integer) row[0];
            Double total = (Double) row[1];
            revenueMap.put(day, total);
        }

        return revenueMap;
    }
}
