package com.marketplace.orderservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateOrderRequest {
    private UUID userId;
    private List<OrderItemRequest> items;
    private ShippingAddress shippingAddress;
    private ShippingAddress billingAddress;
    private String paymentMethod;
    private String notes;

    @Data
    public static class OrderItemRequest {
        private UUID productId;
        private UUID vendorId;
        private String productName;
        private String sku;
        private UUID variantId;
        private String variantName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal discount;
        private String imageUrl;
    }

    @Data
    public static class ShippingAddress {
        private String fullName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String region;
        private String postalCode;
        private String country;
    }
}
