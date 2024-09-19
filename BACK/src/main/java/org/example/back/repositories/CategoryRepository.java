package org.example.back.repositories;

import java.util.List;
import java.util.Optional;

import org.example.back.entities.BrandEntity;
import org.example.back.entities.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    boolean existsByNameAndBrand(String name, BrandEntity marcaEntity);

    Optional<Object> findByIdAndBrand(Long id, BrandEntity brandEntity);

    List<CategoryEntity> findByBrandAndActiveTrue(BrandEntity brandEntity);

}
