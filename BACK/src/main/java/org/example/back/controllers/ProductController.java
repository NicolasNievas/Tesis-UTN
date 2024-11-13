package org.example.back.controllers;

import java.util.List;

import org.example.back.models.Product;
import org.example.back.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

   /*  @GetMapping("/allProductsActive")
    @Operation(summary = "Obtener todos los productos activos", description = "Obtiene todos los productos activos.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsActive() {
        List<Product> products = productService.getAllProductsActive();
        return new ResponseEntity<>(products, HttpStatus.OK);
    } */

    @GetMapping("/allProductsActive")
    @Operation(summary = "Obtener todos los productos activos", description = "Obtiene todos los productos activos.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Page<Product>> getAllProductsActive(@RequestParam(defaultValue = "0") Integer page, @RequestParam(defaultValue = "12") Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getAllProductsActive(pageable);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/allProductsByCategory/{categoryId}")
    @Operation(summary = "Obtener todos los productos por categoría", description = "Obtiene todos los productos por categoría.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.getAllProductsByCategory(categoryId);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/allProductsByBrand/{brandId}")
    @Operation(summary = "Obtener todos los productos por marca", description = "Obtiene todos los productos por marca.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsByBrand(@PathVariable Long brandId) {
        List<Product> products = productService.getAllProductsByBrand(brandId);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/getProductById/{productId}")
    @Operation(summary = "Obtener un producto por ID", description = "Obtiene un producto por ID.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> getProductById(@PathVariable Long productId) {
        Product product = productService.getProductById(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }
}
