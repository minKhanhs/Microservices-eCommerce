package com.order.order_service.Model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @Column(name = "item_id", updatable = false, nullable = false)
    private UUID item_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private UUID product_id;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price_at_order", nullable = false)
    private Double priceAtOrder;

    @Column(name = "product_name", nullable = false, length = 500)
    private String productName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
