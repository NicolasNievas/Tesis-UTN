package org.example.back.repositories;

import org.example.back.entities.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByCustomerIdOrderByDateDesc(Long customerId);
    List<OrderEntity> findAllByOrderByDateDesc();
}
