package org.example.back.repositories;

import org.example.back.entities.OrderEntity;
import org.example.back.entities.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
