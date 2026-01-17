package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.ShippingDTO;
import org.example.back.services.ShippingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shipping")
@CrossOrigin(origins = "http://localhost:3000")
public class ShippingController {

    private final ShippingService shippingService;

    @GetMapping("/methods")
    @Operation(summary = "Get all active shipping methods",
               description = "Retrieve a list of all active shipping methods available.")
    @ApiResponse(responseCode = "200", description = "Successful retrieval of shipping methods")
    public ResponseEntity<List<ShippingDTO>> getShippingMethods() {
        return ResponseEntity.ok(shippingService.getAllActiveShippingMethods());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shipping method details",
            description = "Returns details of a specific shipping method")
    @ApiResponse(responseCode = "200", description = "Método de envío encontrado")
    @ApiResponse(responseCode = "404", description = "Shipping method not found")
    public ResponseEntity<ShippingDTO> getShippingById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(shippingService.getShippingById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/calculate-cost")
    @Operation(summary = "Calculate shipping cost",
            description = "Calculates shipping cost based on method and postal code")
    @ApiResponse(responseCode = "200", description = "Cost calculated successfully")
    @ApiResponse(responseCode = "404", description = "Shipping method not found")
    public ResponseEntity<BigDecimal> calculateCost(
            @PathVariable Long id,
            @RequestParam(required = false) String postalCode) {
        try {
            BigDecimal cost = shippingService.calculateShippingCost(id, postalCode);
            return ResponseEntity.ok(cost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
