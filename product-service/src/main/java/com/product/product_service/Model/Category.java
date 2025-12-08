package com.product.product_service.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "categories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue
    @Column(name="category_id", nullable=false, updatable=false)
    private UUID id;

    private String name;
    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    @JsonIgnore // Tránh vòng lặp vô tận khi convert JSON
    private List<Product> products;
}
