package org.example.back.controllers;

import java.util.List;

import org.example.back.models.Product;
import org.example.back.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @PostMapping("/create")
    @Operation(summary = "Crear un producto", description = "Crea un nuevo producto.")
    @ApiResponse(responseCode = "201", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> createProduct(@RequestBody Product productDTO) {
        Product product = productService.createProduct(productDTO);
        return new ResponseEntity<>(product, HttpStatus.CREATED);
    }

    @PutMapping("/update/{productId}")
    @Operation(summary = "Actualizar un producto", description = "Actualiza un producto existente.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> updateProduct(@PathVariable Long productId, @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(productId, product);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    @PutMapping("/desactive/{productId}")
    @Operation(summary = "Desactivar un producto", description = "Desactiva un producto.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> desactiveProduct(@PathVariable Long productId) {
        Product product = productService.deteleProduct(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @PutMapping("/reactive/{productId}")
    @Operation(summary = "Reactivar un producto", description = "Reactiva un producto.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<Product> reactiveProduct(@PathVariable Long productId) {
        Product product = productService.reactiveProduct(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @GetMapping("/allProducts")
    @Operation(summary = "Obtener todos los productos", description = "Obtiene todos los productos.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/allProductsActive")
    @Operation(summary = "Obtener todos los productos activos", description = "Obtiene todos los productos activos.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsActive() {
        List<Product> products = productService.getAllProductsActive();
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

    @GetMapping("/allProductsDesactive")
    @Operation(summary = "Obtener todos los productos desactivados", description = "Obtiene todos los productos desactivados.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsDesactive() {
        List<Product> products = productService.getAllProductsDesactive();
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
