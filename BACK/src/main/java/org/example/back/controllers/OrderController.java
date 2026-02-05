package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.UserOrderStatisticsDTO;
import org.example.back.dtos.response.PageResponse;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.enums.OrderStatus;
import org.example.back.services.OrderService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required  = false) String searchQuery,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        PageResponse<OrderResponse> response = orderService.getAllOrders(
                status,
                startDate,
                endDate,
                searchQuery,
                page,
                size
        );
        return ResponseEntity.ok(response);
    }
    @PutMapping("/admin/orders/{orderId}/status")
    @Operation(summary = "Update order status (Admin only)",
            description = "Updates the status of an order. Requires ADMINISTRATOR role.")
    @ApiResponse(responseCode = "200", description = "Order status updated successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Order not found")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        try{
            OrderResponse response = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/orders/statistics")
    @Operation(summary = "Get order statistics",
            description = "Retrieves order statistics including total orders, total spent, and orders by status.")
    @ApiResponse(responseCode = "200", description = "Order statistics retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<UserOrderStatisticsDTO> getOrderStatistics(){
        UserOrderStatisticsDTO statistics = orderService.getUserOrderStatistics();
        return ResponseEntity.ok(statistics);
    }
}
