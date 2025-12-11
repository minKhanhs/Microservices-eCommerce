package com.cart.cart_service.Repo;

import com.cart.cart_service.Model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartRepo extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByUserId(UUID user_id);

}
