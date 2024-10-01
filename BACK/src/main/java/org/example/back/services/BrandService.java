package org.example.back.services;

import org.example.back.dtos.BrandDTO;
import org.example.back.dtos.CategoryDTO;
import org.example.back.models.Brand;
import org.example.back.models.Category;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BrandService {
    Brand createBrand(BrandDTO brandDTO);
    Brand updateBrand(Long brandId, BrandDTO brandDTO);
    List<Brand> getAllBrandsActive();
    List<Brand> getAllBrands();
    Category createCategory(Long brandId, CategoryDTO categoryDTO);
    Category updateCategory(Long brandId, Long categoryId, CategoryDTO categoryDTO);
    List<Category> getAllCategoriesByBrandActive(Long brandId);
    List<Category> getAllCategoriesByBrand(Long brandId);
    Brand deleteBrand(Long brandId);
    Brand reactivateBrand(Long brandId);
    Category deleteCategory(Long brandId, Long categoryId);
    Category reactivateCategory(Long brandId, Long categoryId);
}
