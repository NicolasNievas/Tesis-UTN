package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.BrandDTO;
import org.example.back.dtos.CategoryDTO;
import org.example.back.models.Brand;
import org.example.back.models.Category;
import org.example.back.models.Product;
import org.example.back.services.BrandService;
import org.example.back.services.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final ProductService productService;
    private final BrandService brandService;

    @PostMapping("/products/create")
    @Operation(summary = "Crear un producto", description = "Crea un nuevo producto.")
    @ApiResponse(responseCode = "201", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> createProduct(@RequestBody Product productDTO) {
        Product product = productService.createProduct(productDTO);
        return new ResponseEntity<>(product, HttpStatus.CREATED);
    }

    @PutMapping("/products/update/{productId}")
    @Operation(summary = "Actualizar un producto", description = "Actualiza un producto existente.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> updateProduct(@PathVariable Long productId, @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(productId, product);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    @PutMapping("/products/desactive/{productId}")
    @Operation(summary = "Desactivar un producto", description = "Desactiva un producto.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> desactiveProduct(@PathVariable Long productId) {
        Product product = productService.deteleProduct(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @PutMapping("/products/reactive/{productId}")
    @Operation(summary = "Reactivar un producto", description = "Reactiva un producto.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> reactiveProduct(@PathVariable Long productId) {
        Product product = productService.reactiveProduct(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @GetMapping("/products/allProducts")
    @Operation(summary = "Obtener todos los productos", description = "Obtiene todos los productos.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/products/allProductsDesactive")
    @Operation(summary = "Obtener todos los productos desactivados", description = "Obtiene todos los productos desactivados.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsDesactive() {
        List<Product> products = productService.getAllProductsDesactive();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    //Admin Brands
    @PostMapping("/brands/create")
    @Operation(summary = "Crear una marca", description = "Crea una nueva marca.")
    @ApiResponse(responseCode = "201", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<Brand> createBrand(@RequestBody BrandDTO brandDTO) {
        Brand createdBrand = brandService.createBrand(brandDTO);
        return ResponseEntity.ok(createdBrand);
    }

    @PostMapping("/category/{brandId}/category")
    @Operation(summary = "Crear una categoría", description = "Crea una nueva categoría.")
    @ApiResponse(responseCode = "201", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> createCategory(@PathVariable Long brandId, @RequestBody CategoryDTO categoryDTO) {
        Category createdCategory = brandService.createCategory(brandId, categoryDTO);
        return ResponseEntity.ok(createdCategory);
    }

    @PutMapping("/brands/update/{brandId}")
    @Operation(summary = "Actualizar una marca", description = "Actualiza una marca existente.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<Brand> updateBrand(@PathVariable Long brandId, @RequestBody BrandDTO brandDTO) {
        Brand updatedBrand = brandService.updateBrand(brandId, brandDTO);
        return ResponseEntity.ok(updatedBrand);
    }

    @PutMapping("/category/{brandId}/categories/{categoryId}")
    @Operation(summary = "Actualizar una categoría", description = "Actualiza una categoría existente.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> updateCategory(@PathVariable Long brandId, @PathVariable Long categoryId, @RequestBody CategoryDTO categoryDTO) {
        Category updatedCategory = brandService.updateCategory(brandId, categoryId, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    @GetMapping("/brands/allBrands")
    @Operation(summary = "Obtener todas las marcas", description = "Obtiene todas las marcas.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Brand.class)))
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/category/{brandId}/allCategories")
    @Operation(summary = "Obtener todas las categorías", description = "Obtiene todas las categorías.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<List<Category>> getAllCategoriesByBrand(@PathVariable Long brandId) {
        List<Category> categories = brandService.getAllCategoriesByBrand(brandId);
        return ResponseEntity.ok(categories);
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

    @PutMapping("/category/{brandId}/category/{categoryId}/desactive")
    @Operation(summary = "Desactivar una categoría", description = "Desactiva una categoría.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> deactivateCategory(@PathVariable Long brandId, @PathVariable Long categoryId) {
        Category deactivatedCategory = brandService.deleteCategory(brandId, categoryId);
        return ResponseEntity.ok(deactivatedCategory);
    }

    @PutMapping("/category/{brandId}/category/{categoryId}/reactive")
    @Operation(summary = "Reactivar una categoría", description = "Reactiva una categoría.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Category> reactivateCategory(@PathVariable Long brandId, @PathVariable Long categoryId) {
        Category reactivatedCategory = brandService.reactivateCategory(brandId, categoryId);
        return ResponseEntity.ok(reactivatedCategory);
    }
}
