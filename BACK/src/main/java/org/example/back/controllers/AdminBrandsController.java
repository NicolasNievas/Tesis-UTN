package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.BrandDTO;
import org.example.back.models.Brand;
import org.example.back.services.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminBrandsController {

    private final BrandService brandService;

    @PostMapping("/brands/create")
    @Operation(summary = "Crear una marca", description = "Crea una nueva marca.")
    @ApiResponse(responseCode = "201", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<Brand> createBrand(@RequestBody BrandDTO brandDTO) {
        Brand createdBrand = brandService.createBrand(brandDTO);
        return ResponseEntity.ok(createdBrand);
    }

    @PutMapping("/brands/update/{brandId}")
    @Operation(summary = "Actualizar una marca", description = "Actualiza una marca existente.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<Brand> updateBrand(@PathVariable Long brandId, @RequestBody BrandDTO brandDTO) {
        Brand updatedBrand = brandService.updateBrand(brandId, brandDTO);
        return ResponseEntity.ok(updatedBrand);
    }

    @PutMapping("/brands/{brandId}/deactivate")
    @Operation(summary = "Desactivar una marca", description = "Desactiva una marca.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<Brand> deactivateBrand(@PathVariable Long brandId) {
        Brand deactivatedBrand = brandService.deleteBrand(brandId);
        return ResponseEntity.ok(deactivatedBrand);
    }

    @PutMapping("/brands/{brandId}/reactivate")
    @Operation(summary = "Reactivar una marca", description = "Reactiva una marca.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<Brand> reactivateBrand(@PathVariable Long brandId) {
        Brand reactivatedBrand = brandService.reactivateBrand(brandId);
        return ResponseEntity.ok(reactivatedBrand);
    }

    @GetMapping("/brands/allBrands")
    @Operation(summary = "Obtener todas las marcas", description = "Obtiene todas las marcas.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }
}
