package com.cart.cart_service.Service;

import com.cart.cart_service.Model.Cart;
import com.cart.cart_service.Model.CartItem;
import com.cart.cart_service.Model.ProductRef;
import com.cart.cart_service.Repo.CartItemRepo;
import com.cart.cart_service.Repo.CartRepo;
import com.cart.cart_service.client.ProductClient;
import com.cart.cart_service.dto.AddToCartRequest;
import com.cart.cart_service.dto.CartItemResponse;
import com.cart.cart_service.dto.CartResponse;
import com.cart.cart_service.dto.ProductResponse;
import feign.FeignException;
import feign.RetryableException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepo cartRepository;
    private final CartItemRepo cartItemRepository;
    private final ProductClient productClient;

    @Transactional
    public void addToCart(UUID userId, AddToCartRequest request) {
        UUID productId = request.getProductId();
        Integer quantityRequest = request.getQuantity();

        // 1. Gọi Product Service (Chỉ gọi 1 lần trong try-catch)
        ProductResponse product;
        try {
            product = productClient.getProductById(productId);
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId);
        } catch (RetryableException e) {
            throw new RuntimeException("Hệ thống sản phẩm đang bảo trì, vui lòng thử lại sau.");
        } catch (Exception e) {
            // Bắt Exception chung để an toàn hơn
            throw new RuntimeException("Lỗi khi lấy thông tin sản phẩm: " + e.getMessage());
        }

        // 2. Validate cơ bản
        if (product == null) {
            throw new RuntimeException("Sản phẩm không tồn tại (Null response)");
        }

        // Check nếu khách muốn mua số lượng > kho ngay từ đầu
        if (quantityRequest > product.getStock()) {
            throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho hiện có (" + product.getStock() + ")");
        }

        // 3. Tìm hoặc tạo giỏ hàng
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = Cart.builder()
                    .userId(userId)
                    .cartItems(new ArrayList<>())
                    .build();
            return cartRepository.save(newCart);
        });

        // 4. Xử lý Item
        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(item -> item.getProductRef().getProductId().equals(productId))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newTotalQuantity = existingItem.getQuantity() + quantityRequest;

            // CHECK TỒN KHO LẦN 2: Tổng cũ + Mới phải <= Kho
            if (newTotalQuantity > product.getStock()) {
                throw new RuntimeException("Tổng số lượng trong giỏ (" + newTotalQuantity +
                        ") vượt quá tồn kho (" + product.getStock() + ")");
            }

            existingItem.setQuantity(newTotalQuantity);
            existingItem.getProductRef().setPrice(product.getPrice());
            existingItem.getProductRef().setStock(product.getStock());

        } else {
            // --- TRƯỜNG HỢP THÊM MỚI ---
            ProductRef productRef = ProductRef.builder()
                    .productId(product.getId())
                    .name(product.getName())
                    .price(product.getPrice())
                    .stock(product.getStock())
                    .build();

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productRef(productRef)
                    .quantity(quantityRequest)
                    .build();

            cart.getCartItems().add(newItem);
        }

        // 5. Lưu DB
        cartRepository.save(cart);
    }
    // --- 1. XEM GIỎ HÀNG ---
    public CartResponse getMyCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Nếu chưa có giỏ thì trả về giỏ rỗng (không lưu DB để tiết kiệm)
                    return Cart.builder()
                            .userId(userId)
                            .cartItems(new ArrayList<>())
                            .build();
                });

        return mapToCartResponse(cart);
    }

    // --- 2. XÓA SẢN PHẨM KHỎI GIỎ ---
    public void removeItems(UUID userId, List<UUID> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return;
        }

        // 2. Tìm giỏ hàng để lấy Cart ID
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));
        cartItemRepository.deleteCartItems(cart.getId(), productIds);
    }

    // --- 3. CẬP NHẬT SỐ LƯỢNG ---
    public void updateQuantity(UUID userId, UUID productId, int quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        CartItem item = cart.getCartItems().stream()
                .filter(i -> i.getProductRef().getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ"));

        // QUAN TRỌNG: Phải check tồn kho lại lần nữa
        // Vì nhỡ lúc thêm thì còn hàng, giờ update lên số lượng lớn thì hết hàng
        try {
            ProductResponse product = productClient.getProductById(productId);
            if (product.getStock() < quantity) {
                throw new RuntimeException("Kho chỉ còn " + product.getStock() + " sản phẩm");
            }
            // Cập nhật giá luôn để đảm bảo giá đúng thời điểm hiện tại
            item.getProductRef().setPrice(product.getPrice());
            item.getProductRef().setStock(product.getStock());

        } catch (Exception e) {
            // Nếu Product Service chết, tạm thời cho phép update với giá cũ hoặc chặn luôn tùy bạn
            throw new RuntimeException("Không thể kiểm tra tồn kho: " + e.getMessage());
        }

        item.setQuantity(quantity);
        cartRepository.save(cart);
    }
    // --- HÀM MAPPER (Chuyển Entity -> DTO) ---
    private CartResponse mapToCartResponse(Cart cart) {
        // Tính tổng tiền
        double totalPrice = cart.getCartItems().stream()
                .mapToDouble(item -> item.getProductRef().getPrice() * item.getQuantity())
                .sum();

        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(item -> CartItemResponse.builder()
                        .itemId(item.getId())
                        .productId(item.getProductRef().getProductId())
                        .productName(item.getProductRef().getName())
                        .price(item.getProductRef().getPrice())
                        .quantity(item.getQuantity())
                        .subTotal(item.getProductRef().getPrice() * item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUserId())
                .items(items)
                .totalPrice(totalPrice)
                .build();
    }


}
