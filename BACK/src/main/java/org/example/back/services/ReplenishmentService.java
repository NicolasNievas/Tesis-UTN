package org.example.back.services;

import org.example.back.entities.MovementType;
import org.example.back.entities.ReplenishmentEntity;
import org.example.back.models.Replenishment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface ReplenishmentService {
    List<Replenishment> getAllReplenishments(MovementType movementType, Long productId, LocalDateTime startDate, LocalDateTime endDate);
    Replenishment getReplenishmentById(Long id);
    List<Replenishment> getReplenishmentsByMovementType(MovementType type);
}
