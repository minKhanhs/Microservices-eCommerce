package com.cart.cart_service.Repo;

import com.cart.cart_service.Model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface CartItemRepo extends JpaRepository<CartItem, UUID> {
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.productRef.productId = :productId")
    void deleteCartItem(UUID cartId, UUID productId);
}
