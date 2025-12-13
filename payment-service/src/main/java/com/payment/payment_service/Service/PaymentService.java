package com.payment.payment_service.Service;

import com.payment.payment_service.client.OrderClient;
import com.payment.payment_service.Config.VnPayConfig;
import com.payment.payment_service.Model.*;
import com.payment.payment_service.Repo.PaymentRepo;
import com.payment.payment_service.Repo.TransactionRepo;
import com.payment.payment_service.dto.OrderResponse;
import com.payment.payment_service.dto.PaymentRequest;
import com.payment.payment_service.dto.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepo paymentRepository;
    private final TransactionRepo transactionRepository;
    private final OrderClient orderClient;
    private final VnPayConfig vnPayConfig;

    // 1. TẠO THANH TOÁN
    @Transactional
    public PaymentResponse createPayment(HttpServletRequest request, PaymentRequest req) {
        // 1. GỌI ORDER SERVICE ĐỂ LẤY SỐ TIỀN CHUẨN (BẢO MẬT)
        OrderResponse orderResponse;
        try {
            orderResponse = orderClient.getOrderById(req.getOrderId());
        } catch (Exception e) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }
        if (!orderResponse.getUserId().equals(req.getUserId())) {
            throw new RuntimeException("Bạn không có quyền thanh toán đơn hàng của người khác!");
        }

        // Lấy số tiền thật từ Database
        Double realAmount = orderResponse.getTotalAmount();

        // 2. Kiểm tra Payment tồn tại (Logic cũ, nhưng thay req.getAmount() bằng realAmount)
        Optional<Payment> existingPayment = paymentRepository.findByOrderId(req.getOrderId());
        Payment payment;

        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                throw new RuntimeException("Đơn hàng này đã được thanh toán!");
            }
            payment.setPaymentMethod(req.getPaymentMethod());
            payment.setAmount(realAmount); // Cập nhật lại tiền phòng khi đơn hàng đổi giá
        } else {
            payment = Payment.builder()
                    .orderId(req.getOrderId())
                    .userId(req.getUserId())
                    .amount(realAmount) // Dùng realAmount
                    .paymentMethod(req.getPaymentMethod())
                    .status(PaymentStatus.PENDING)
                    .build();
            payment = paymentRepository.save(payment);
        }

        // 3. Xử lý tạo URL (Dùng realAmount)
        if (req.getPaymentMethod() == PaymentMethod.COD) {
            return PaymentResponse.builder()
                    .status("OK")
                    .message("Đã ghi nhận thanh toán COD")
                    .url(null)
                    .build();
        }
        else if (req.getPaymentMethod() == PaymentMethod.VNPAY) {
            // Truyền realAmount vào hàm tạo URL
            String paymentUrl = createVnPayUrl(request, realAmount, req.getOrderId());
            return PaymentResponse.builder()
                    .status("OK")
                    .message("Chuyển hướng đến VNPay")
                    .url(paymentUrl)
                    .build();
        }

        throw new RuntimeException("Phương thức thanh toán không hỗ trợ");
    }

    // 2. XỬ LÝ CALLBACK TỪ VNPAY
    @Transactional
    public void processVnPayCallback(Map<String, String> queryParams) {
        String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
        String orderIdStr = queryParams.get("vnp_OrderInfo");
        String vnp_Amount = queryParams.get("vnp_Amount"); // VNPay trả về số tiền x100 (dạng String)
        String vnp_TxnRef = queryParams.get("vnp_TxnRef");

        UUID orderId = UUID.fromString(orderIdStr);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán cho Order ID: " + orderId));

        // CHUYỂN ĐỔI DOUBLE: Chia 100 để về giá trị thực
        Double amount = Double.parseDouble(vnp_Amount) / 100;

        Transaction transaction = Transaction.builder()
                .payment(payment)
                .amount(amount)
                .transactionReference(vnp_TxnRef)
                .gatewayResponseCode(vnp_ResponseCode)
                .createdAt(LocalDateTime.now())
                .build();

        if ("00".equals(vnp_ResponseCode)) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setGatewayMessage("Giao dịch thành công");

            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);

            try {
                orderClient.updateOrderStatus(orderId, "CONFIRMED");
            } catch (Exception e) {
                System.err.println("Lỗi gọi Order Service: " + e.getMessage());
            }
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setGatewayMessage("Giao dịch thất bại");
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }

        transactionRepository.save(transaction);
    }

    // --- HÀM PHỤ: TẠO URL VNPAY (Dùng Double) ---
    private String createVnPayUrl(HttpServletRequest request, Double amount, UUID orderId) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = VnPayConfig.getRandomNumber(8);
        String vnp_IpAddr = VnPayConfig.getIpAddress(request);
        String vnp_TmnCode = vnPayConfig.getVnp_TmnCode();

        // CHUYỂN ĐỔI DOUBLE: Nhân 100 và ép kiểu về long
        long amountVal = (long) (amount * 100);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountVal));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderId.toString());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(zoneId);

        // 2. Format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // 3. Expire Date
        String vnp_ExpireDate = now.plusMinutes(15).format(formatter);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Build Hash & URL
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
    }
}