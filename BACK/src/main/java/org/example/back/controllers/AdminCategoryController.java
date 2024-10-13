package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.CategoryDTO;
import org.example.back.models.Category;
import org.example.back.services.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminCategoryController {

    private final BrandService brandService;

    @PostMapping("/category/{brandId}/create")
    @Operation(summary = "Crear una categoría", description = "Crea una nueva categoría.")
    @ApiResponse(responseCode = "201", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> createCategory(@PathVariable Long brandId, @RequestBody CategoryDTO categoryDTO) {
        Category createdCategory = brandService.createCategory(brandId, categoryDTO);
        return ResponseEntity.ok(createdCategory);
    }

    @PutMapping("/category/{brandId}/{categoryId}/update")
    @Operation(summary = "Actualizar una categoría", description = "Actualiza una categoría existente.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> updateCategory(@PathVariable Long brandId, @PathVariable Long categoryId, @RequestBody CategoryDTO categoryDTO) {
        Category updatedCategory = brandService.updateCategory(brandId, categoryId, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    @GetMapping("/category/{brandId}/allCategories")
    @Operation(summary = "Obtener todas las categorías", description = "Obtiene todas las categorías.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<List<Category>> getAllCategoriesByBrand(@PathVariable Long brandId) {
        List<Category> categories = brandService.getAllCategoriesByBrand(brandId);
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/category/{brandId}/{categoryId}/desactive")
    @Operation(summary = "Desactivar una categoría", description = "Desactiva una categoría.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> deactivateCategory(@PathVariable Long brandId, @PathVariable Long categoryId) {
        Category deactivatedCategory = brandService.deleteCategory(brandId, categoryId);
        return ResponseEntity.ok(deactivatedCategory);
    }

    @PutMapping("/category/{brandId}/{categoryId}/reactive")
    @Operation(summary = "Reactivar una categoría", description = "Reactiva una categoría.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> reactivateCategory(@PathVariable Long brandId, @PathVariable Long categoryId) {
        Category reactivatedCategory = brandService.reactivateCategory(brandId, categoryId);
        return ResponseEntity.ok(reactivatedCategory);
    }
}
