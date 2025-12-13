package com.order.order_service.Service;

import com.order.order_service.Model.Order;
import com.order.order_service.Model.OrderItem;
import com.order.order_service.Model.OrderStatus;
import com.order.order_service.Repo.OrderRepo;
import com.order.order_service.client.CartClient;
import com.order.order_service.client.ProductClient;
import com.order.order_service.client.UserClient;
import com.order.order_service.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepo orderRepository;

    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::mapToOrderResponse);
    }
    // 1. Lấy đơn hàng của User
    public Page<OrderResponse> getMyOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::mapToOrderResponse);
    }

    // 2. Xem chi tiết (Có check quyền sở hữu)
    public OrderResponse getOrderById(UUID orderId, UUID currentUserId, String role) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // LOGIC BẢO MẬT:
        // Nếu KHÔNG PHẢI Admin VÀ ID người xem KHÁC ID chủ đơn hàng -> Chặn
        if (!"ADMIN".equals(role) && !order.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này");
        }

        return mapToOrderResponse(order);
    }

    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));

        // 1. Kiểm tra nếu trạng thái hiện tại đã là trạng thái cuối cùng
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã hoàn tất hoặc bị hủy, không thể thay đổi trạng thái nữa.");
        }

        // 2. Kiểm tra logic cụ thể cho từng trạng thái mới
        switch (newStatus) {
            case CANCELLED:
                if (order.getStatus() == OrderStatus.SHIPPED) {
                    throw new RuntimeException("Đơn hàng đã giao cho vận chuyển, không thể hủy.");
                }
                break;

            case SHIPPED:
                // Không thể ship nếu chưa xác nhận hoặc xử lý
                if (order.getStatus() == OrderStatus.PENDING) {
                    throw new RuntimeException("Cần xác nhận đơn hàng trước khi giao.");
                }
                break;

            case DELIVERED:
                // Chỉ được chuyển thành DELIVERED từ SHIPPED
                if (order.getStatus() != OrderStatus.SHIPPED) {
                    throw new RuntimeException("Đơn hàng cần phải ở trạng thái Đang giao (SHIPPED) trước khi Hoàn tất.");
                }
                break;
            default:
                // Ta có thể dùng ordinal() để so sánh thứ tự.
                if (order.getStatus().ordinal() > newStatus.ordinal()) {
                    throw new RuntimeException("Không thể quay ngược trạng thái đơn hàng.");
                }
                break;
        }
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }



 // LOGIC ĐẶT HÀNG TỪ GIỎ VÀ TRỰC TIẾP
    private final ProductClient productClient;
    private final CartClient cartClient;
    private final UserClient userClient;

    // --- HÀM 1: CORE LOGIC (Xử lý chung) ---
    private Order processOrderCreation(UUID userId, String address, String phone, List<OrderItemDTO> itemsToBuy) {
        // 1. Khởi tạo Order
        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .shippingAddress(address)
                .phone(phone)
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        Double totalAmount = 0.0;

        // 2. Duyệt list để Trừ kho & Map Entity
        for (OrderItemDTO dto : itemsToBuy) {
            // Gọi Product Service trừ kho
            try {
                productClient.reduceStock(dto.getProductId(), dto.getQuantity());
            } catch (Exception e) {
                // Lỗi này bắt buộc throw để Rollback
                throw new RuntimeException("Sản phẩm " + dto.getProductName() + " hết hàng hoặc lỗi: " + e.getMessage());
            }

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(dto.getProductId())
                    .productName(dto.getProductName())
                    .quantity(dto.getQuantity())
                    .priceAtOrder(dto.getPrice())
                    .build();

            orderItems.add(item);
            totalAmount += dto.getPrice() * dto.getQuantity();
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        // 3. Lưu DB
        return orderRepository.save(order);
    }

    // --- HÀM 2: LOGIC PHỤ TRỢ (Tách xử lý địa chỉ ra riêng) ---
    private DeliveryInfo resolveDeliveryInfo(UUID userId, UUID addressId, String requestAddress, String requestPhone) {
        String finalAddress = requestAddress;
        String finalPhone = requestPhone;

        // Chỉ gọi User Service khi cần thiết
        if (addressId != null || finalPhone == null || finalPhone.trim().isEmpty()) {
            UserProfileResponse userProfile;
            try {
                userProfile = userClient.getProfile(userId);
            } catch (Exception e) {
                throw new RuntimeException("Không thể lấy thông tin người dùng: " + e.getMessage());
            }

            if (userProfile == null) throw new RuntimeException("User không tồn tại!");

            // A. Lấy SĐT
            if (finalPhone == null || finalPhone.trim().isEmpty()) {
                finalPhone = userProfile.getPhone();
                if (finalPhone == null || finalPhone.trim().isEmpty()) {
                    throw new RuntimeException("Vui lòng cung cấp số điện thoại nhận hàng!");
                }
            }

            // B. Lấy Địa chỉ từ ID
            if (addressId != null) {
                if (userProfile.getAddresses() == null || userProfile.getAddresses().isEmpty()) {
                    throw new RuntimeException("Sổ địa chỉ của bạn đang trống!");
                }
                String foundAddress = userProfile.getAddresses().stream()
                        .filter(addr -> addr.getId().equals(addressId))
                        .map(AddressDTO::getFullAddress)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Địa chỉ đã chọn không tồn tại!"));
                finalAddress = foundAddress;
            }
        }

        if (finalAddress == null || finalAddress.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng cung cấp địa chỉ giao hàng!");
        }

        return new DeliveryInfo(finalAddress, finalPhone);
    }

    // --- API 1: ĐẶT HÀNG TỪ GIỎ ---
    public OrderResponse placeOrderFromCart(UUID userId, OrderRequest request) {
        // 1. Xử lý địa chỉ & SĐT (Gọi hàm phụ)
        DeliveryInfo deliveryInfo = resolveDeliveryInfo(userId, request.getAddressId(), request.getShippingAddress(), request.getPhone());

        // 2. Lấy dữ liệu từ Cart Service
        CartResponse cart = cartClient.getMyCart(userId);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống!");
        }

        // 3. Lọc sản phẩm user chọn
        List<OrderItemDTO> itemsToBuy = cart.getItems().stream()
                .filter(item -> request.getSelectedProductIds().contains(item.getProductId()))
                .map(item -> new OrderItemDTO(
                        item.getProductId(),
                        item.getProductName(),
                        item.getPrice(),
                        item.getQuantity()))
                .collect(Collectors.toList());

        if (itemsToBuy.isEmpty()) {
            throw new RuntimeException("Bạn chưa chọn sản phẩm nào để mua!");
        }

        // 4. GỌI HÀM CHUNG TẠO ĐƠN
        Order savedOrder = processOrderCreation(userId, deliveryInfo.getAddress(), deliveryInfo.getPhone(), itemsToBuy);

        // 5. Xóa giỏ hàng (QUAN TRỌNG: Dùng try-catch nhưng KHÔNG throw exception)
        try {
            cartClient.removeItems(userId, request.getSelectedProductIds());
        } catch (Exception e) {
            // Chỉ log lỗi, KHÔNG throw exception để tránh rollback đơn hàng đã thành công
            System.err.println("Cảnh báo: Đặt hàng thành công nhưng lỗi xóa giỏ hàng - " + e.getMessage());
        }

        return mapToOrderResponse(savedOrder);
    }

    // --- API 2: MUA NGAY (BUY NOW) ---
    public OrderResponse placeOrderBuyNow(UUID userId, BuyNowRequest request) {
        // 1. Xử lý địa chỉ & SĐT (Tái sử dụng hàm phụ)
        DeliveryInfo deliveryInfo = resolveDeliveryInfo(userId, request.getAddressId(), request.getShippingAddress(), request.getPhone());

        // 2. Lấy dữ liệu từ Product Service
        ProductResponse product = productClient.getProductById(request.getProductId());
        if (product == null) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }

        // 3. Tạo list 1 món
        List<OrderItemDTO> itemsToBuy = List.of(
                new OrderItemDTO(
                        product.getId(),
                        product.getName(),
                        product.getPrice(),
                        request.getQuantity()
                )
        );

        // 4. GỌI HÀM CHUNG TẠO ĐƠN
        Order savedOrder = processOrderCreation(userId, deliveryInfo.getAddress(), deliveryInfo.getPhone(), itemsToBuy);

        return mapToOrderResponse(savedOrder);
    }

    //--Huy don
    @Transactional
    public void cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        // 1. Check quyền chính chủ
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này!");
        }

        // 2. Check trạng thái (Chỉ PENDING mới được hủy)
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Đơn hàng đã được xác nhận hoặc đang giao, không thể hủy!");
        }

        // 3. Cập nhật trạng thái
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // 4. QUAN TRỌNG: Hoàn lại tồn kho cho từng món
        for (OrderItem item : order.getItems()) {
            try {
                productClient.increaseStock(item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                // Log lỗi, nhưng không chặn việc hủy đơn.
                // Có thể cần cơ chế Retry sau này nếu Product Service chết.
                System.err.println("Lỗi hoàn kho cho sản phẩm " + item.getProductId() + ": " + e.getMessage());
            }
        }
    }

    public OrderResponse getOrderByIdInternal(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return mapToOrderResponse(order);
    }


    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .itemId(item.getItemId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPriceAtOrder())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}
