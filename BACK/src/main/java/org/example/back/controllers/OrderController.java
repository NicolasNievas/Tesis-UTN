package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.response.PageResponse;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.entities.OrderStatus;
import org.example.back.services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/orders/get")
    @Operation(summary = "Get all orders for current user",
            description = "Retrieves all orders for the authenticated user")
    @ApiResponse(responseCode = "200", description = "Orders retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        List<OrderResponse> orders = orderService.getUserOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/admin/orders")
    @Operation(summary = "Get all orders (Admin only)",
            description = "Retrieves all orders in the system. Requires ADMINISTRATOR role.")
    @ApiResponse(responseCode = "200", description = "Orders retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrders(

            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        PageResponse<OrderResponse> response = orderService.getAllOrders(

                status,
                page,
                size
        );
        return ResponseEntity.ok(response);
    }
}
