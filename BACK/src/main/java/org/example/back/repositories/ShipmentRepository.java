package org.example.back.repositories;

import org.example.back.entities.ShipmentEntity;
import org.example.back.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<ShipmentEntity, Long> {
    Optional<ShipmentEntity> findByOrderId(Long orderId);
    Optional<ShipmentEntity> findByTrackingCode(String trackingCode);
    List<ShipmentEntity> findByStatus(ShipmentStatus status);
    List<ShipmentEntity> findByCarrier(String carrier);
}
