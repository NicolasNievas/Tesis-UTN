package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.response.InvoiceResponse;
import org.example.back.dtos.response.PurchaseOrderResponse;
import org.example.back.dtos.response.SimulatedDeliveryResponse;
import org.example.back.models.DeliveryConfirmationDetail;
import org.example.back.models.ProviderOrderDetail;
import org.example.back.services.PurchaseOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping("/{providerId}")
    @Operation(summary = "Create a purchase order", description = "Create a purchase order")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<PurchaseOrderResponse> createOrder(
            @PathVariable Long providerId,
            @RequestBody List<ProviderOrderDetail> details) {
        PurchaseOrderResponse response = purchaseOrderService.createPurchaseOrderNew(providerId, details);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}/simulate")
    @Operation(summary = "Simulate delivery", description = "Simulate the delivery for a purchase order")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<SimulatedDeliveryResponse> simulateDelivery(@PathVariable Long orderId) {
        SimulatedDeliveryResponse response = purchaseOrderService.simulateProviderResponse(orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/confirm")
    @Operation(summary = "Confirm delivery", description = "Confirm the delivery for a purchase order")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<InvoiceResponse> confirmDelivery(
            @PathVariable Long orderId,
            @RequestBody List<DeliveryConfirmationDetail> details) {
        InvoiceResponse response = purchaseOrderService.createInvoiceFromDelivery(orderId, details);
        return ResponseEntity.ok(response);
    }
}

