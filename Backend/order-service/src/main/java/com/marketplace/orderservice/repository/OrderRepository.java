package com.marketplace.orderservice.repository;

import com.marketplace.orderservice.entity.Order;
import com.marketplace.orderservice.entity.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<Order> findByOrderNumberAndTenantId(String orderNumber, UUID tenantId);

    List<Order> findByTenantIdAndUserIdOrderByCreatedAtDesc(UUID tenantId, UUID userId);

    List<Order> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, OrderStatus status);

    List<Order> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    @Query("SELECT o FROM Order o WHERE o.tenantId = :tenantId AND o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByTenantIdAndDateRange(
            @Param("tenantId") UUID tenantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenantId = :tenantId AND o.status = :status")
    Long countByTenantIdAndStatus(
            @Param("tenantId") UUID tenantId,
            @Param("status") OrderStatus status
    );

    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id AND o.tenantId = :tenantId")
    Optional<Order> findByIdAndTenantIdWithItems(
            @Param("id") UUID id,
            @Param("tenantId") UUID tenantId
    );
}
