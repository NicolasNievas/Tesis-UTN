package org.example.back.controllers;

import org.example.back.dtos.BrandDTO;
import org.example.back.dtos.CategoryDTO;
import org.example.back.models.Brand;
import org.example.back.models.Category;
import org.example.back.services.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@RestController
@RequestMapping("/brands")
@CrossOrigin(origins = "http://localhost:3000")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @PostMapping("/create")
    public ResponseEntity<Brand> createBrand(@RequestBody BrandDTO brandDTO) {
        Brand createdBrand = brandService.createBrand(brandDTO);
        return ResponseEntity.ok(createdBrand);
    }

    @PostMapping("/{brandId}/category")
    public ResponseEntity<Category> createCategory(@PathVariable Long brandId, @RequestBody CategoryDTO categoryDTO) {
        Category createdCategory = brandService.createCategory(brandId, categoryDTO);
        return ResponseEntity.ok(createdCategory);
    }

    @PutMapping("/update/{brandId}")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long brandId, @RequestBody BrandDTO brandDTO) {
        Brand updatedBrand = brandService.updateBrand(brandId, brandDTO);
        return ResponseEntity.ok(updatedBrand);
    }

    @PutMapping("/{brandId}/categories/{categoryId}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long brandId, @PathVariable Long categoryId, @RequestBody CategoryDTO categoryDTO) {
        Category updatedCategory = brandService.updateCategory(brandId, categoryId, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Brand>> getAllBrandsActive() {
        List<Brand> brands = brandService.getAllBrandsActive();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/allBrands")
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{brandId}/categoriesActive")
    public ResponseEntity<List<Category>> getAllCategoriesByBrandActive(@PathVariable Long brandId) {
        List<Category> categories = brandService.getAllCategoriesByBrandActive(brandId);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{brandId}/allCategories")
    public ResponseEntity<List<Category>> getAllCategoriesByBrand(@PathVariable Long brandId) {
        List<Category> categories = brandService.getAllCategoriesByBrand(brandId);
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{brandId}/deactivate")
    public ResponseEntity<Brand> deactivateBrand(@PathVariable Long brandId) {
        Brand deactivatedBrand = brandService.deleteBrand(brandId);
        return ResponseEntity.ok(deactivatedBrand);
    }

    @PutMapping("/{brandId}/reactivate")
    public ResponseEntity<Brand> reactivateBrand(@PathVariable Long brandId) {
        Brand reactivatedBrand = brandService.reactivateBrand(brandId);
        return ResponseEntity.ok(reactivatedBrand);
    }

    @PutMapping("/{brandId}/category/{categoryId}/desactive")
    @Operation(summary = "Desactivar una categoría", description = "Desactiva una categoría.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> deactivateCategory(@PathVariable Long brandId, @PathVariable Long categoryId) {
        Category deactivatedCategory = brandService.deleteCategory(brandId, categoryId);
        return ResponseEntity.ok(deactivatedCategory);
    }

    @PutMapping("/{brandId}/category/{categoryId}/reactive")
    @Operation(summary = "Reactivar una categoría", description = "Reactiva una categoría.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> reactivateCategory(@PathVariable Long brandId, @PathVariable Long categoryId) {
        Category reactivatedCategory = brandService.reactivateCategory(brandId, categoryId);
        return ResponseEntity.ok(reactivatedCategory);
    }
}
