package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.models.Product;
import org.example.back.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminProductController {

    private final ProductService productService;

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
/*
    @GetMapping("/products/allProducts")
    @Operation(summary = "Obtener todos los productos", description = "Obtiene todos los productos.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
*/
    @GetMapping("/products/allProducts")
    @Operation(summary = "Obtener todos los productos paginados",
            description = "Obtiene todos los productos con paginación.")
    @ApiResponse(responseCode = "200",
            description = "Operación exitosa",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)))
    @ApiResponse(responseCode = "403", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productService.getAllProducts(pageable);
        return new ResponseEntity<>(productPage, HttpStatus.OK);
    }

    @GetMapping("/products/allProductsDesactive")
    @Operation(summary = "Obtener todos los productos desactivados", description = "Obtiene todos los productos desactivados.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsDesactive() {
        List<Product> products = productService.getAllProductsDesactive();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/products/allProductsWithNoStock")
    @Operation(summary = "Obtener todos los productos sin stock", description = "Obtiene todos los productos sin stock.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Product.class)))
    public ResponseEntity<List<Product>> getAllProductsWithNoStock() {
        List<Product> products = productService.getAllProductsWithNoStock();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
}
