package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/get")
    @Operation(summary = "Get all orders for current user",
            description = "Retrieves all orders for the authenticated user")
    @ApiResponse(responseCode = "200", description = "Orders retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        List<OrderResponse> orders = orderService.getUserOrders();
        return ResponseEntity.ok(orders);
    }
}
