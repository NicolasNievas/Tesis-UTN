package org.example.back.repositories;

import org.example.back.entities.OrderEntity;
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
        @Query("SELECT o FROM OrderEntity o WHERE " + "(:startDate IS NULL OR o.date >= :startDate) AND " +
                        "(:endDate IS NULL OR o.date <= :endDate) AND " + "(:status IS NULL OR o.status = :status) "
                        + "ORDER BY o.date DESC")
        Page<OrderEntity> findOrdersByFilters(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("status") String status,
                        Pageable pageable);
}
