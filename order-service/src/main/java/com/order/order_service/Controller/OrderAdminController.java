package com.order.order_service.Controller;

import com.order.order_service.Service.OrderAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders/admin")
@RequiredArgsConstructor
public class OrderAdminController {
    private final OrderAdminService adminService;

    // GET orders/admin/stats/dashboard
    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // GET orders/admin/stats/revenue-daily?month=12&year=2025
    @GetMapping("/revenue-daily")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getDailyRevenueChart(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(adminService.getDailyRevenueChart(month, year));
    }
}
