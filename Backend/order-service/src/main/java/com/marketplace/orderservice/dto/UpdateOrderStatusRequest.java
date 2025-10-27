package com.marketplace.orderservice.dto;

import com.marketplace.orderservice.entity.Order.OrderStatus;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    private OrderStatus status;
    private String reason;
}
