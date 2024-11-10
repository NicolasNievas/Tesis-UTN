package org.example.back.repositories;

import java.util.List;

import org.example.back.entities.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdIsNot(String name, Long id);

    List<ProductEntity> findByActiveTrue();

    List<ProductEntity> findByCategoryId(Long categoryId);

    List<ProductEntity> findByBrandId(Long brandId);

    List<ProductEntity> findByActiveFalse();

    List<ProductEntity> findByStock(int stock);

    Page<ProductEntity> findByActiveTrue(Pageable pageable);
}
