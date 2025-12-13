package com.product.product_service.Controller;

import com.product.product_service.Repo.ProductRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/products/admin")
@RequiredArgsConstructor
public class ProductAdminController {

    private final ProductRepo productRepository;

    // API 1: Lấy danh sách sắp hết hàng
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockProducts(@RequestParam(defaultValue = "10") int threshold) {
        try {
            // Logic chính
            var products = productRepository.findByStockLessThan(threshold);

            // Trả về 200 OK kèm dữ liệu
            return ResponseEntity.ok(products);

        } catch (Exception e) {
            // 1. In lỗi ra Console để Dev sửa (Quan trọng)
            System.err.println("Lỗi tại API /low-stock: " + e.getMessage());
            e.printStackTrace();

            // 2. Trả về JSON lỗi chuẩn cho Frontend/Postman
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi hệ thống khi lấy danh sách sản phẩm");
            errorResponse.put("detail", e.getMessage()); // Có thể bỏ dòng này nếu muốn bảo mật

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // API 2: Đếm tổng sản phẩm
    @GetMapping("/count")
    public ResponseEntity<?> getTotalProductCount() {
        try {
            // Logic chính
            long count = productRepository.count();

            // Trả về 200 OK
            return ResponseEntity.ok(count);

        } catch (Exception e) {
            // 1. In lỗi ra Console
            System.err.println("Lỗi tại API /count: " + e.getMessage());
            e.printStackTrace();

            // 2. Trả về lỗi 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể đếm số lượng sản phẩm. Lỗi: " + e.getMessage());
        }
    }
}
