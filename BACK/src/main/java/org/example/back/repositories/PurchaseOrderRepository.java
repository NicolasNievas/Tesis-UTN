package org.example.back.repositories;

import org.example.back.entities.PurchaseOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseOrderRepository  extends JpaRepository<PurchaseOrderEntity, Long> {
}
