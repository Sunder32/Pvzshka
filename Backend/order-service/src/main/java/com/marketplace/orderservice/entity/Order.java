package com.marketplace.orderservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_status")
    private FulfillmentStatus fulfillmentStatus;

    // Pricing
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "shipping_cost", precision = 10, scale = 2)
    private BigDecimal shippingCost;

    @Column(name = "tax", precision = 10, scale = 2)
    private BigDecimal tax;

    @Column(name = "discount", precision = 10, scale = 2)
    private BigDecimal discount;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // Delivery
    @Column(name = "delivery_type", length = 50)
    private String deliveryType;

    @Column(name = "delivery_address", columnDefinition = "jsonb")
    private String deliveryAddress;

    @Column(name = "pvz_id")
    private UUID pvzId;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    // Customer info
    @Column(name = "customer_email", length = 255)
    private String customerEmail;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "customer_note", columnDefinition = "text")
    private String customerNote;

    // Metadata
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_reason", columnDefinition = "text")
    private String cancelledReason;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PAID,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        REFUNDED
    }

    public enum PaymentStatus {
        PENDING,
        AUTHORIZED,
        PAID,
        FAILED,
        REFUNDED
    }

    public enum FulfillmentStatus {
        UNFULFILLED,
        PARTIALLY_FULFILLED,
        FULFILLED
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    public void calculateTotal() {
        this.subtotal = items.stream()
                .map(OrderItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmount = subtotal
                .add(shippingCost != null ? shippingCost : BigDecimal.ZERO)
                .add(tax != null ? tax : BigDecimal.ZERO)
                .subtract(discount != null ? discount : BigDecimal.ZERO);
    }
}
