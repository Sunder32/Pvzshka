package com.marketplace.orderservice.dto;

import com.marketplace.orderservice.entity.Order.OrderStatus;
import com.marketplace.orderservice.entity.Order.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderResponse {
    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;
    private String currency;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private String shippingAddress;
    private String billingAddress;
    private String notes;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class OrderItemResponse {
        private UUID id;
        private UUID productId;
        private UUID vendorId;
        private String productName;
        private String sku;
        private UUID variantId;
        private String variantName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal subtotal;
        private String imageUrl;
    }
}
