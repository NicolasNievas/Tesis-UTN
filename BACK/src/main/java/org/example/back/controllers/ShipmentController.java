package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.request.CreateShipmentRequest;
import org.example.back.dtos.request.UpdateShipmentStatusRequest;
import org.example.back.dtos.response.ShipmentResponse;
import org.example.back.services.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("")
@CrossOrigin(origins = "http://localhost:3000")
public class ShipmentController {
    private final ShipmentService shipmentService;

    @PostMapping("/admin/shipments/create")
    @Operation(summary = "Create shipment (Admin only)",
            description = "Creates a shipment for a completed order")
    @ApiResponse(responseCode = "200", description = "Shipment created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ShipmentResponse> createShipment(@RequestBody CreateShipmentRequest request) {
        ShipmentResponse response = shipmentService.createShipment(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/shipments/{shipmentId}/status")
    @Operation(summary = "Update shipment status (Admin only)")
    @ApiResponse(responseCode = "200", description = "Status updated successfully")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ShipmentResponse> updateShipmentStatus(
            @PathVariable Long shipmentId,
            @RequestBody UpdateShipmentStatusRequest request) {
        ShipmentResponse response = shipmentService.updateShipmentStatus(shipmentId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shipments/track/{trackingCode}")
    @Operation(summary = "Track shipment by code",
            description = "Get shipment details and tracking history by tracking code")
    @ApiResponse(responseCode = "200", description = "Shipment found")
    @ApiResponse(responseCode = "404", description = "Shipment not found")
    public ResponseEntity<ShipmentResponse> trackShipment(@PathVariable String trackingCode) {
        ShipmentResponse response = shipmentService.getShipmentByTrackingCode(trackingCode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shipments/order/{orderId}")
    @Operation(summary = "Get shipment by order ID")
    @ApiResponse(responseCode = "200", description = "Shipment found")
    @ApiResponse(responseCode = "404", description = "Shipment not found")
    public ResponseEntity<ShipmentResponse> getShipmentByOrder(@PathVariable Long orderId) {
        ShipmentResponse response = shipmentService.getShipmentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }
}
