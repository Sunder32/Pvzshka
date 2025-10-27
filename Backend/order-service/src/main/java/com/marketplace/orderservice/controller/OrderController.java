package com.marketplace.orderservice.controller;

import com.marketplace.orderservice.dto.CreateOrderRequest;
import com.marketplace.orderservice.dto.OrderResponse;
import com.marketplace.orderservice.dto.UpdateOrderStatusRequest;
import com.marketplace.orderservice.entity.Order;
import com.marketplace.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestHeader("X-User-ID") UUID userId,
            @RequestBody CreateOrderRequest request
    ) {
        OrderResponse response = orderService.createOrder(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID id
    ) {
        OrderResponse response = orderService.getOrderById(tenantId, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable String orderNumber
    ) {
        OrderResponse response = orderService.getOrderByNumber(tenantId, orderNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID userId
    ) {
        List<OrderResponse> responses = orderService.getOrdersByUser(tenantId, userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable Order.OrderStatus status
    ) {
        List<OrderResponse> responses = orderService.getOrdersByStatus(tenantId, status);
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestHeader("X-Tenant-ID") UUID tenantId
    ) {
        List<OrderResponse> responses = orderService.getAllOrders(tenantId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponse response = orderService.updateOrderStatus(tenantId, id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID id,
            @RequestParam(required = false) String reason
    ) {
        OrderResponse response = orderService.cancelOrder(tenantId, id, reason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<OrderResponse>> getOrdersByDateRange(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        List<OrderResponse> responses = orderService.getOrdersByDateRange(tenantId, startDate, endDate);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> getOrderCountByStatus(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable Order.OrderStatus status
    ) {
        Long count = orderService.getOrderCountByStatus(tenantId, status);
        return ResponseEntity.ok(count);
    }
}
