package org.example.back.repositories;

import org.example.back.entities.ReplenishmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReplenishmentRepository extends JpaRepository<ReplenishmentEntity, Long> {
}
