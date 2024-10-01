package org.example.back.repositories;

import java.util.List;

import org.example.back.entities.BrandEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends JpaRepository<BrandEntity, Long> {
    boolean existsByName(String name);
    
    boolean existsByNameIgnoreCase(String name);

    List<BrandEntity> findByActiveTrue();
}
