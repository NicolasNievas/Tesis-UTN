package org.example.back.repositories;

import org.example.back.entities.PaymentMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Long>{
    Optional<PaymentMethodEntity> findByName(String name);
}
