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

    @GetMapping("/active")
    public ResponseEntity<List<Brand>> getAllBrandsActive() {
        List<Brand> brands = brandService.getAllBrandsActive();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{brandId}/categoriesActive")
    public ResponseEntity<List<Category>> getAllCategoriesByBrandActive(@PathVariable Long brandId) {
        List<Category> categories = brandService.getAllCategoriesByBrandActive(brandId);
        return ResponseEntity.ok(categories);
    }
}
