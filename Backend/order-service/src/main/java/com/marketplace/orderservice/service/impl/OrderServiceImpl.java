package com.marketplace.orderservice.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.orderservice.dto.CreateOrderRequest;
import com.marketplace.orderservice.dto.OrderResponse;
import com.marketplace.orderservice.dto.UpdateOrderStatusRequest;
import com.marketplace.orderservice.entity.Order;
import com.marketplace.orderservice.entity.OrderItem;
import com.marketplace.orderservice.repository.OrderRepository;
import com.marketplace.orderservice.service.OrderService;
import com.marketplace.orderservice.kafka.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final KafkaProducerService kafkaProducer;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(UUID tenantId, UUID userId, CreateOrderRequest request) {
        log.info("Creating order for tenant: {}, user: {}", tenantId, userId);

        // Generate order number
        String orderNumber = generateOrderNumber();

        // Create order entity
        Order order = new Order();
        order.setTenantId(tenantId);
        order.setCustomerId(userId);
        order.setOrderNumber(orderNumber);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setFulfillmentStatus(Order.FulfillmentStatus.UNFULFILLED);
        order.setShippingCost(BigDecimal.ZERO);
        order.setTax(BigDecimal.ZERO);
        order.setDiscount(BigDecimal.ZERO);
        order.setCustomerNote(request.getNotes());

        // Convert addresses to JSON
        try {
            order.setDeliveryAddress(objectMapper.writeValueAsString(request.getShippingAddress()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize addresses", e);
        }

        // Add order items
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setTenantId(tenantId);
            item.setProductId(itemRequest.getProductId());
            item.setVendorId(itemRequest.getVendorId());
            item.setTitle(itemRequest.getProductName());
            item.setSku(itemRequest.getSku());
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(itemRequest.getPrice());
            order.addItem(item);
        }

        // Calculate totals
        order.calculateTotal();

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Publish event
        kafkaProducer.publishOrderCreated(savedOrder);

        log.info("Order created successfully: {}", savedOrder.getOrderNumber());

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID tenantId, UUID orderId) {
        Order order = orderRepository.findByIdAndTenantIdWithItems(orderId, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(UUID tenantId, String orderNumber) {
        Order order = orderRepository.findByOrderNumberAndTenantId(orderNumber, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(UUID tenantId, UUID userId) {
        return orderRepository.findByTenantIdAndCustomerIdOrderByCreatedAtDesc(tenantId, userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(UUID tenantId, Order.OrderStatus status) {
        return orderRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(UUID tenantId) {
        return orderRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID tenantId, UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(request.getStatus());

        Order updatedOrder = orderRepository.save(order);

        // Publish event
        kafkaProducer.publishOrderStatusChanged(updatedOrder, oldStatus, request.getStatus());

        return mapToResponse(updatedOrder);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID tenantId, UUID orderId, String reason) {
        Order order = orderRepository.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.DELIVERED || 
            order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order in current status");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancelledReason(reason);

        Order updatedOrder = orderRepository.save(order);

        // Publish event
        kafkaProducer.publishOrderCancelled(updatedOrder, reason);

        return mapToResponse(updatedOrder);
    }

    @Override
    @Transactional
    public void processPayment(UUID tenantId, UUID orderId, String paymentId) {
        Order order = orderRepository.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setStatus(Order.OrderStatus.PAID);

        orderRepository.save(order);

        log.info("Payment processed for order: {}", order.getOrderNumber());
    }

    @Override
    @Transactional
    public void confirmShipment(UUID tenantId, UUID orderId, String trackingNumber) {
        Order order = orderRepository.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.OrderStatus.SHIPPED);

        orderRepository.save(order);

        // Publish event
        kafkaProducer.publishOrderShipped(order, trackingNumber);

        log.info("Shipment confirmed for order: {}", order.getOrderNumber());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByDateRange(UUID tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByTenantIdAndDateRange(tenantId, startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getOrderCountByStatus(UUID tenantId, Order.OrderStatus status) {
        return orderRepository.countByTenantIdAndStatus(tenantId, status);
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTenantId(order.getTenantId());
        response.setUserId(order.getCustomerId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus());
        response.setSubtotal(order.getSubtotal());
        response.setShippingCost(order.getShippingCost());
        response.setTax(order.getTax());
        response.setDiscount(order.getDiscount());
        response.setTotal(order.getTotalAmount());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setShippingAddress(order.getDeliveryAddress());
        response.setNotes(order.getCustomerNote());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        if (order.getItems() != null) {
            response.setItems(order.getItems().stream()
                    .map(this::mapItemToResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private OrderResponse.OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderResponse.OrderItemResponse response = new OrderResponse.OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProductId());
        response.setVendorId(item.getVendorId());
        response.setProductName(item.getTitle());
        response.setSku(item.getSku());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setSubtotal(item.getTotal());
        return response;
    }
}
