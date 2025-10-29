package com.marketplace.orderservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.orderservice.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String ORDER_CREATED_TOPIC = "order.created";
    private static final String ORDER_STATUS_CHANGED_TOPIC = "order.status.changed";
    private static final String ORDER_CANCELLED_TOPIC = "order.cancelled";
    private static final String ORDER_SHIPPED_TOPIC = "order.shipped";

    public void publishOrderCreated(Order order) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("event_type", "order.created");
            event.put("tenant_id", order.getTenantId().toString());
            event.put("order_id", order.getId().toString());
            event.put("order_number", order.getOrderNumber());
            event.put("customer_id", order.getCustomerId().toString());
            event.put("total_amount", order.getTotalAmount());
            event.put("status", order.getStatus().name());
            event.put("timestamp", System.currentTimeMillis());

            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_CREATED_TOPIC, order.getTenantId().toString(), message);

            log.info("Published order.created event for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to publish order.created event", e);
        }
    }

    public void publishOrderStatusChanged(Order order, Order.OrderStatus oldStatus, Order.OrderStatus newStatus) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("event_type", "order.status.changed");
            event.put("tenant_id", order.getTenantId().toString());
            event.put("order_id", order.getId().toString());
            event.put("order_number", order.getOrderNumber());
            event.put("old_status", oldStatus.name());
            event.put("new_status", newStatus.name());
            event.put("timestamp", System.currentTimeMillis());

            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_STATUS_CHANGED_TOPIC, order.getTenantId().toString(), message);

            log.info("Published order.status.changed event for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to publish order.status.changed event", e);
        }
    }

    public void publishOrderCancelled(Order order, String reason) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("event_type", "order.cancelled");
            event.put("tenant_id", order.getTenantId().toString());
            event.put("order_id", order.getId().toString());
            event.put("order_number", order.getOrderNumber());
            event.put("reason", reason);
            event.put("timestamp", System.currentTimeMillis());

            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_CANCELLED_TOPIC, order.getTenantId().toString(), message);

            log.info("Published order.cancelled event for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to publish order.cancelled event", e);
        }
    }

    public void publishOrderShipped(Order order, String trackingNumber) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("event_type", "order.shipped");
            event.put("tenant_id", order.getTenantId().toString());
            event.put("order_id", order.getId().toString());
            event.put("order_number", order.getOrderNumber());
            event.put("tracking_number", trackingNumber);
            event.put("timestamp", System.currentTimeMillis());

            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_SHIPPED_TOPIC, order.getTenantId().toString(), message);

            log.info("Published order.shipped event for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to publish order.shipped event", e);
        }
    }
}
