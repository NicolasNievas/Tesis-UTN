package org.example.back.controllers;

import org.example.back.dtos.BrandDTO;
import org.example.back.dtos.CategoryDTO;
import org.example.back.models.Brand;
import org.example.back.models.Category;
import org.example.back.services.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @PostMapping("/brand")
    public ResponseEntity<Brand> createBrand(@RequestBody BrandDTO brandDTO) {
        Brand createdBrand = brandService.createBrand(brandDTO);
        return ResponseEntity.ok(createdBrand);
    }

    @PostMapping("/{brandId}/category")
    public ResponseEntity<Category> createCategory(@PathVariable Long brandId, @RequestBody CategoryDTO categoryDTO) {
        Category createdCategory = brandService.createCategory(brandId, categoryDTO);
        return ResponseEntity.ok(createdCategory);
    }

    @PutMapping("/brand")
    public ResponseEntity<Brand> updateBrand(@RequestBody Brand brand) {
        Brand updatedBrand = brandService.updateBrand(brand);
        return ResponseEntity.ok(updatedBrand);
    }

    @PutMapping("/{brandId}/categories/{categoryId}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long brandId, @PathVariable Long categoryId, @RequestBody Category category) {
        category.setId(categoryId);
        Category updatedCategory = brandService.updateCategory(brandId, category);
        return ResponseEntity.ok(updatedCategory);
    }

    @GetMapping("/brands/active")
    public ResponseEntity<List<Brand>> getAllBrandsActive() {
        List<Brand> brands = brandService.getAllBrandsActive();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/allBrands")
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{brandId}/categories")
    public ResponseEntity<List<Category>> getAllCategoriesByBrand(@PathVariable Long brandId) {
        List<Category> categories = brandService.getAllCategoriesByBrand(brandId);
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/brand/{brandId}/deactivate")
    public ResponseEntity<Brand> deactivateBrand(@PathVariable Long brandId) {
        Brand deactivatedBrand = brandService.deleteBrand(brandId);
        return ResponseEntity.ok(deactivatedBrand);
    }

    @PutMapping("brand/{brandId}/reactivate")
    public ResponseEntity<Brand> reactivateBrand(@PathVariable Long brandId) {
        Brand reactivatedBrand = brandService.reactivateBrand(brandId);
        return ResponseEntity.ok(reactivatedBrand);
    }
}
