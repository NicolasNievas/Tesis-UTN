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

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByCustomerIdOrderByDateDesc(Long customerId);
    List<OrderEntity> findAllByOrderByDateDesc();
    @Query(value = """
            SELECT * FROM orders o 
            WHERE 
            (COALESCE(:status, o.status) = o.status) 
            AND (COALESCE(CAST(:startDate AS TIMESTAMP), o.date) <= o.date)
            AND (COALESCE(CAST(:endDate AS TIMESTAMP), o.date) >= o.date)
            ORDER BY o.date DESC
            """,
            countQuery = """
            SELECT COUNT(*) FROM orders o 
            WHERE 
            (COALESCE(:status, o.status) = o.status)
            AND (COALESCE(CAST(:startDate AS TIMESTAMP), o.date) <= o.date)
            AND (COALESCE(CAST(:endDate AS TIMESTAMP), o.date) >= o.date)
            """,
            nativeQuery = true)
    Page<OrderEntity> findOrdersByFilters(
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    // Reporte de ventas por método de pago
    @Query("""
        SELECT pm.name AS paymentMethod, 
               COUNT(o.id) AS orderCount, 
               SUM(od.price * od.quantity) AS totalSales 
        FROM OrderEntity o 
        JOIN o.paymentMethod pm 
        JOIN o.details od 
        WHERE o.date BETWEEN :startDate AND :endDate 
        GROUP BY pm.name
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
        SELECT COALESCE(SUM(od.price * od.quantity), 0) 
        FROM OrderDetailEntity od 
        JOIN od.order o 
        WHERE o.customer.id = :customerId
    """)
    BigDecimal getTotalSpentByCustomer(@Param("customerId") Long customerId);

    // Contar total de órdenes por usuario
    Long countByCustomerId(Long customerId);
}
