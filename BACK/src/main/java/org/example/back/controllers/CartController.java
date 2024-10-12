package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.CartDTO;
import org.example.back.services.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;

    @GetMapping("/get")
    @Operation(summary = "Obtener carrito del usuario", description = "Obtiene el carrito del usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Carrito obtenido exitosamente")
    @ApiResponse(responseCode = "401", description = "No autorizado")
    public ResponseEntity<CartDTO> getCart() {
        return ResponseEntity.ok(cartService.getCartByUser());
    }

    @PostMapping("/add")
    @Operation(summary = "Agregar producto al carrito", description = "Agrega un producto al carrito del usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Producto agregado exitosamente")
    @ApiResponse(responseCode = "401", description = "No autorizado")
    public ResponseEntity<CartDTO> addToCart(@RequestParam Long productId) {
        return ResponseEntity.ok(cartService.addItemToCart(productId));
    }

    @PutMapping("/item/{productId}")
    @Operation(summary = "Actualizar cantidad de producto en el carrito", description = "Actualiza la cantidad de un producto en el carrito del usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Cantidad actualizada exitosamente")
    @ApiResponse(responseCode = "401", description = "No autorizado")
    public ResponseEntity<CartDTO> updateCartItem(@PathVariable Long productId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItem(productId, quantity));
    }

    @DeleteMapping("/item/{productId}")
    @Operation(summary = "Eliminar producto del carrito", description = "Elimina un producto del carrito del usuario autenticado")
    @ApiResponse(responseCode = "204", description = "Producto eliminado exitosamente")
    @ApiResponse(responseCode = "401", description = "No autorizado")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long productId) {
        cartService.removeItemFromCart(productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Limpiar carrito", description = "Elimina todos los productos del carrito del usuario autenticado")
    @ApiResponse(responseCode = "204", description = "Carrito limpiado exitosamente")
    @ApiResponse(responseCode = "401", description = "No autorizado")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
