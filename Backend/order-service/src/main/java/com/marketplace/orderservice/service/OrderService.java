package com.marketplace.orderservice.service;

import com.marketplace.orderservice.dto.CreateOrderRequest;
import com.marketplace.orderservice.dto.OrderResponse;
import com.marketplace.orderservice.dto.UpdateOrderStatusRequest;
import com.marketplace.orderservice.entity.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(UUID tenantId, UUID userId, CreateOrderRequest request);

    OrderResponse getOrderById(UUID tenantId, UUID orderId);

    OrderResponse getOrderByNumber(UUID tenantId, String orderNumber);

    List<OrderResponse> getOrdersByUser(UUID tenantId, UUID userId);

    List<OrderResponse> getOrdersByStatus(UUID tenantId, Order.OrderStatus status);

    List<OrderResponse> getAllOrders(UUID tenantId);

    OrderResponse updateOrderStatus(UUID tenantId, UUID orderId, UpdateOrderStatusRequest request);

    OrderResponse cancelOrder(UUID tenantId, UUID orderId, String reason);

    void processPayment(UUID tenantId, UUID orderId, String paymentId);

    void confirmShipment(UUID tenantId, UUID orderId, String trackingNumber);

    List<OrderResponse> getOrdersByDateRange(UUID tenantId, LocalDateTime startDate, LocalDateTime endDate);

    Long getOrderCountByStatus(UUID tenantId, Order.OrderStatus status);
}
