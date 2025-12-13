package com.order.order_service.Repo;

import com.order.order_service.Model.Order;
import com.order.order_service.Model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepo extends JpaRepository<Order, UUID> {
    Page<Order> findByUserId(UUID userId, Pageable pageable);
    // 1. Tính tổng doanh thu của các đơn hàng ĐÃ THÀNH CÔNG (CONFIRMED, SHIPPED, DELIVERED)
    // Tránh cộng đơn PENDING hoặc CANCELLED
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')")
    Double calculateTotalRevenue();

    // 2. Đếm số lượng đơn theo trạng thái
    long countByStatus(OrderStatus status);

    // 3. Tính doanh thu theo tháng trong thangs hiện tại (Để vẽ biểu đồ)
    @Query("SELECT DAY(o.createdAt) as day, SUM(o.totalAmount) as total " +
            "FROM Order o " +
            "WHERE o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED') " +
            "AND MONTH(o.createdAt) = :month AND YEAR(o.createdAt) = :year " +
            "GROUP BY DAY(o.createdAt) " +
            "ORDER BY DAY(o.createdAt) ASC")
    List<Object[]> findRevenueByDayInMonth(@Param("month") int month, @Param("year") int year);

    // 4. Tìm Top 5 sản phẩm bán chạy nhất (Dựa vào bảng OrderItem)
    @Query("SELECT oi.productName, SUM(oi.quantity) as totalSold, oi.productId " +
            "FROM OrderItem oi " +
            "GROUP BY oi.productName, oi.productId " +
            "ORDER BY totalSold DESC " +
            "LIMIT 5")
    List<Object[]> findTopSellingProducts();

}
