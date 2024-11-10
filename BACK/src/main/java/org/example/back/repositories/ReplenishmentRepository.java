package org.example.back.repositories;

import org.example.back.enums.MovementType;
import org.example.back.entities.ReplenishmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplenishmentRepository extends JpaRepository<ReplenishmentEntity, Long>, JpaSpecificationExecutor<ReplenishmentEntity> {
    List<ReplenishmentEntity> findByMovementType(MovementType movementType);
}
