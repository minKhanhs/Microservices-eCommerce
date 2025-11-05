package com.product.product_service.Model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue
    @Column(name = "prodcuct_id", nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;
    private String description;

    @Column(nullable = false)
    private double price;
    private int stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
