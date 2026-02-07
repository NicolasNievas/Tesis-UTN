package org.example.back.repositories;

import org.example.back.entities.OrderEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@org.springframework.stereotype.Repository
public interface ReportRepository extends Repository<OrderEntity, Long> {
    // ==================== REPORTES DE VENTAS ====================

    /**
     * Ventas agrupadas por período (día/semana/mes)
     */
    @Query(value = """
        SELECT 
            DATE_TRUNC(:periodType, o.date) as period,
            COUNT(o.id) as orderCount,
            SUM(od.price * od.quantity) + SUM(COALESCE(o.shipping_cost, 0)) as totalSales
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        WHERE o.date BETWEEN :startDate AND :endDate
        AND o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY period
        ORDER BY period DESC
        """, nativeQuery = true)
    List<Object[]> getSalesByPeriod(
            @Param("periodType") String periodType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Ticket promedio y estadísticas de pedidos
     */
    @Query("""
        SELECT 
            COUNT(DISTINCT o.id) as totalOrders,
            AVG(o.subtotal + COALESCE(o.shippingCost, 0)) as averageTicket,
            MAX(o.subtotal + COALESCE(o.shippingCost, 0)) as maxTicket,
            MIN(o.subtotal + COALESCE(o.shippingCost, 0)) as minTicket
        FROM OrderEntity o
        WHERE o.date BETWEEN :startDate AND :endDate
        AND o.status NOT IN ('CANCELLED', 'PENDING')
    """)
    List<Object[]> getOrderStatistics(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ==================== REPORTES DE CLIENTES ====================

    /**
     * Estadísticas por cliente
     */
    @Query("""
        SELECT 
            u.id as customerId,
            CONCAT(u.firstName, ' ', u.lastName) as customerName,
            u.email as email,
            u.city as city,
            COUNT(DISTINCT o.id) as totalOrders,
            SUM(o.subtotal + COALESCE(o.shippingCost, 0)) as totalSpent,
            AVG(o.subtotal + COALESCE(o.shippingCost, 0)) as averageOrderValue,
            MAX(o.date) as lastPurchaseDate
        FROM OrderEntity o
        JOIN o.customer u
        WHERE o.date BETWEEN :startDate AND :endDate
        AND o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY u.id, u.firstName, u.lastName, u.email, u.city
        ORDER BY totalSpent DESC
    """)
    List<Object[]> getCustomerStatistics(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Top clientes
     */
    @Query("""
        SELECT 
            u.id,
            CONCAT(u.firstName, ' ', u.lastName) as customerName,
            COUNT(DISTINCT o.id) as totalOrders,
            SUM(o.subtotal + COALESCE(o.shippingCost, 0)) as totalSpent
        FROM OrderEntity o
        JOIN o.customer u
        WHERE o.status = 'DELIVERED'
        GROUP BY u.id, u.firstName, u.lastName
        ORDER BY totalSpent DESC
        LIMIT :limit
    """)
    List<Object[]> getTopCustomers(@Param("limit") int limit);

    // ==================== REPORTES DE INVENTARIO ====================

    /**
     * Estado del inventario
     */
    @Query(value = """
    SELECT 
        p.id as productId,
        p.name as productName,
        p.stock as currentStock,
        p.price,
        (p.stock * p.price) as inventoryValue,
        COALESCE(sales.total_sold, 0) as totalSold,
        COALESCE(sales.total_revenue, 0) as totalRevenue,
        CASE 
            WHEN p.stock = 0 THEN 'OUT_OF_STOCK'
            WHEN p.stock <= 10 THEN 'LOW_STOCK'
            WHEN p.stock <= 50 THEN 'AVERAGE_STOCK'
            ELSE 'HIGH_STOCK'
        END as stockStatus,
        CASE 
            WHEN p.stock = 0 AND COALESCE(sales.total_sold, 0) > 0 THEN 100.00
            WHEN p.stock > 0 THEN 
                (COALESCE(sales.total_sold, 0) * 100.00) / NULLIF(p.stock + COALESCE(sales.total_sold, 0), 0)
            ELSE 0.00
        END as turnoverRate
    FROM products p
    LEFT JOIN (
        SELECT 
            od.product_id,
            SUM(od.quantity) as total_sold,
            SUM(od.price * od.quantity) as total_revenue
        FROM order_details od
        JOIN orders o ON od.order_id = o.id
        WHERE o.date BETWEEN :startDate AND :endDate
        AND o.status = 'DELIVERED'
        GROUP BY od.product_id
    ) sales ON p.id = sales.product_id
    WHERE p.active = true
    ORDER BY COALESCE(sales.total_sold, 0) DESC, COALESCE(sales.total_revenue, 0) DESC, p.name ASC
    LIMIT 100 
    """, nativeQuery = true)
    List<Object[]> getInventoryReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Productos sin movimiento
     */
    @Query(value = """
    SELECT 
        p.id,
        p.name,
        p.stock,
        p.price,
        (p.stock * p.price) as inventory_value,
        GREATEST(
            (SELECT MAX(o.date) 
             FROM orders o 
             JOIN order_details od ON o.id = od.order_id 
             WHERE od.product_id = p.id 
             AND o.status IN ('DELIVERED')),
            (SELECT MAX(r.date) 
             FROM replenishments r 
             WHERE r.product_id = p.id)
        ) as last_movement_date,
        COALESCE(
            (SELECT SUM(od.quantity) 
             FROM order_details od 
             JOIN orders o ON od.order_id = o.id 
             WHERE od.product_id = p.id 
             AND o.date >= :startDate
             AND o.status IN ('DELIVERED')),
            0
        ) as total_sold
    FROM products p
    WHERE p.active = true
    AND NOT EXISTS (
        SELECT 1 
        FROM order_details od 
        JOIN orders o ON od.order_id = o.id 
        WHERE od.product_id = p.id 
        AND o.date >= :startDate
        AND o.status IN ('DELIVERED')
    )
    ORDER BY last_movement_date ASC NULLS FIRST
    """, nativeQuery = true)
    List<Object[]> getProductsWithoutMovement(
            @Param("startDate") LocalDateTime startDate
    );

    // ==================== REPORTES DE CATEGORÍAS Y MARCAS ====================

    /**
     * Ventas por categoría
     */
    @Query("""
        SELECT 
            c.id,
            c.name as categoryName,
            b.name as brandName,
            COUNT(DISTINCT od.id) as itemsSold,
            SUM(od.quantity) as totalQuantity,
            SUM(od.price * od.quantity) as totalSales
        FROM OrderEntity o
        JOIN o.details od
        JOIN od.product p
        JOIN p.category c
        JOIN p.brand b
        WHERE o.date BETWEEN :startDate AND :endDate
        AND o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY c.id, c.name, b.name
        ORDER BY totalSales DESC
    """)
    List<Object[]> getSalesByCategory(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Ventas por marca
     */
    @Query("""
        SELECT 
            b.id,
            b.name as brandName,
            COUNT(DISTINCT od.id) as itemsSold,
            SUM(od.quantity) as totalQuantity,
            SUM(od.price * od.quantity) as totalSales
        FROM OrderEntity o
        JOIN o.details od
        JOIN od.product p
        JOIN p.brand b
        WHERE o.date BETWEEN :startDate AND :endDate
        AND o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY b.id, b.name
        ORDER BY totalSales DESC
    """)
    List<Object[]> getSalesByBrand(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ==================== REPORTES DE ESTADOS ====================

    /**
     * Distribución de órdenes por estado
     */
    @Query("""
        SELECT 
            o.status,
            COUNT(o.id) as orderCount,
            SUM(o.subtotal + COALESCE(o.shippingCost, 0)) as totalAmount
        FROM OrderEntity o
        WHERE o.date BETWEEN :startDate AND :endDate
        GROUP BY o.status
        ORDER BY orderCount DESC
    """)
    List<Object[]> getOrdersByStatus(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Tasa de conversión (completadas vs canceladas)
     */
    @Query("""
        SELECT 
            COUNT(CASE WHEN o.status IN ('DELIVERED', 'COMPLETED') THEN 1 END) as completed,
            COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) as cancelled,
            COUNT(CASE WHEN o.status = 'PENDING' THEN 1 END) as pending,
            COUNT(CASE WHEN o.status = 'PAID' THEN 1 END) as paid,
            COUNT(CASE WHEN o.status = 'PROCESSING' THEN 1 END) as processing,
            COUNT(CASE WHEN o.status = 'SHIPPED' THEN 1 END) as shipped,
            COUNT(o.id) as total
        FROM OrderEntity o
        WHERE o.date BETWEEN :startDate AND :endDate
    """)
    List<Object[]> getConversionRate(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Reporte de métodos de envío más utilizados
     */
    @Query("""
    SELECT 
        s.displayName AS shippingMethod,
        COUNT(o.id) as orderCount,
        SUM(o.subtotal + COALESCE(o.shippingCost, 0)) as totalSales,
        AVG(COALESCE(o.shippingCost, 0)) as averageShippingCost
    FROM OrderEntity o
    JOIN o.shipping s
    WHERE o.date BETWEEN :startDate AND :endDate
    AND o.status NOT IN ('CANCELLED', 'PENDING')
    GROUP BY s.displayName, s.name
    ORDER BY orderCount DESC
""")
    List<Object[]> getShippingMethodReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Tendencias Mensuales de ventas
     */
    @Query(value = """
    SELECT 
        TO_CHAR(o.date, 'YYYY-MM') as month,
        COUNT(o.id) as orderCount,
        SUM(o.subtotal + COALESCE(o.shipping_cost, 0)) as totalSales,
        AVG(o.subtotal + COALESCE(o.shipping_cost, 0)) as averageTicket
    FROM orders o
    WHERE o.date BETWEEN :startDate AND :endDate
    AND o.status NOT IN ('CANCELLED', 'PENDING')
    GROUP BY TO_CHAR(o.date, 'YYYY-MM')
    ORDER BY month
""", nativeQuery = true)
    List<Object[]> getTTMonthSales(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Producto top por período (día/semana/mes)
     */
    @Query(value = """
    WITH PeriodData AS (
        SELECT 
            p.id as productId,
            p.name as productName,
            DATE_TRUNC(:periodType, o.date) as period,
            SUM(od.quantity) as totalQuantity,
            SUM(od.price * od.quantity) as totalSales
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        JOIN products p ON od.product_id = p.id
        WHERE o.date BETWEEN :startDate AND :endDate
        AND o.status NOT IN ('CANCELLED', 'PENDING')
        GROUP BY p.id, p.name, DATE_TRUNC(:periodType, o.date), o.date
    ),
    LatestPeriod AS (
        SELECT MAX(period) as latest_period
        FROM PeriodData
    )
    SELECT 
        pd.productId,
        pd.productName,
        pd.totalQuantity,
        pd.totalSales,
        pd.period
    FROM PeriodData pd
    CROSS JOIN LatestPeriod lp
    WHERE pd.period = lp.latest_period
    ORDER BY pd.totalSales DESC
    LIMIT 1
""", nativeQuery = true)
    List<Object[]> getTopProductByPeriod(
            @Param("periodType") String periodType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
