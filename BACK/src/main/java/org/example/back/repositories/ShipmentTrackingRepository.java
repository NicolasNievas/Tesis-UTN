package org.example.back.repositories;

import org.example.back.entities.ShipmentTrackingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTrackingEntity, Long> {
    List<ShipmentTrackingEntity> findByShipmentIdOrderByTimestampDesc(Long shipmentId);
    List<ShipmentTrackingEntity> findByShipmentTrackingCodeOrderByTimestampDesc(String trackingCode);
}
