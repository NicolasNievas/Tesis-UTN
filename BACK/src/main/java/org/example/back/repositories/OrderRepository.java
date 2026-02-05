package org.example.back.repositories;

import org.example.back.entities.OrderEntity;
import org.example.back.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByCustomerIdOrderByDateDesc(Long customerId);
    List<OrderEntity> findAllByOrderByDateDesc();
    @Query(value = """
    SELECT o.* FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 
    (CAST(:status AS VARCHAR) IS NULL OR o.status = CAST(:status AS VARCHAR))
    AND (CAST(:startDate AS TIMESTAMP) IS NULL OR o.date >= CAST(:startDate AS TIMESTAMP))
    AND (CAST(:endDate AS TIMESTAMP) IS NULL OR o.date <= CAST(:endDate AS TIMESTAMP))
    AND (
        CAST(:searchQuery AS VARCHAR) IS NULL 
        OR CAST(o.id AS TEXT) LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
        OR o.payment_id LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
        OR o.mercadopago_order_id LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
        OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS VARCHAR), '%'))
        OR o.customer_nro_doc LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
    )
    ORDER BY o.date DESC
    """,
            countQuery = """
    SELECT COUNT(o.id) FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 
    (CAST(:status AS VARCHAR) IS NULL OR o.status = CAST(:status AS VARCHAR))
    AND (CAST(:startDate AS TIMESTAMP) IS NULL OR o.date >= CAST(:startDate AS TIMESTAMP))
    AND (CAST(:endDate AS TIMESTAMP) IS NULL OR o.date <= CAST(:endDate AS TIMESTAMP))
    AND (
        CAST(:searchQuery AS VARCHAR) IS NULL 
        OR CAST(o.id AS TEXT) LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
        OR o.payment_id LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
        OR o.mercadopago_order_id LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
        OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS VARCHAR), '%'))
        OR o.customer_nro_doc LIKE CONCAT('%', CAST(:searchQuery AS VARCHAR), '%')
    )
    """,
            nativeQuery = true)
    Page<OrderEntity> findOrdersByFilters(
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("searchQuery") String searchQuery,
            Pageable pageable);

    // Reporte de ventas por método de pago
    @Query("""
        SELECT pm.displayName AS paymentMethod, 
               COUNT(o.id) AS orderCount, 
               SUM(od.price * od.quantity + COALESCE(o.shippingCost, 0)) AS totalSales 
        FROM OrderEntity o 
        JOIN o.paymentMethod pm 
        JOIN o.details od 
        WHERE o.date BETWEEN :startDate AND :endDate 
        AND o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY pm.displayName
        ORDER BY totalSales DESC
    """)
    List<Object[]> getPaymentMethodSalesReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Reporte de productos más vendidos
    @Query("""
        SELECT p.name AS productName, 
               SUM(od.quantity) AS totalQuantity, 
               SUM(od.price * od.quantity) AS totalSales 
        FROM OrderDetailEntity od 
        JOIN od.product p 
        JOIN od.order o 
        WHERE o.date BETWEEN :startDate AND :endDate 
        AND o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY p.name 
        ORDER BY totalQuantity DESC
    """)
    List<Object[]> getTopSellingProductsReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    // Contar órdenes por usuario y estado
    Long countByCustomerIdAndStatus(Long customerId, OrderStatus status);

    // Obtener total gastado por usuario
    @Query("""
        SELECT COALESCE(SUM(o.subtotal + COALESCE(o.shippingCost, 0)), 0)
        FROM OrderEntity o
        WHERE o.customer.id = :customerId
        AND o.status NOT IN ('CANCELLED', 'PENDING')
    """)
    BigDecimal getTotalSpentByCustomer(@Param("customerId") Long customerId);

    // Contar total de órdenes por usuario
    Long countByCustomerId(Long customerId);

    @Query("SELECT o FROM OrderEntity o WHERE o.id = :orderId AND o.customer.id = :userId")
    Optional<OrderEntity> findByIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);
}
