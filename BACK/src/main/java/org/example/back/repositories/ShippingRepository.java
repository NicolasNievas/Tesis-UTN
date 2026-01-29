package org.example.back.repositories;

import org.example.back.dtos.ShippingDTO;
import org.example.back.entities.ShippingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingRepository extends JpaRepository<ShippingEntity, Long> {
    List<ShippingEntity> findByActiveTrue();
    Optional<ShippingEntity> findByName(String name);
}
