package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.enums.MovementType;
import org.example.back.models.Replenishment;
import org.example.back.services.ReplenishmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/replenishment")
@CrossOrigin(origins = "http://localhost:3000")
public class ReplenishmentController {
    private final ReplenishmentService replenishmentService;

    @GetMapping()
    @Operation(summary = "Get all replenishments", description = "Get all replenishments")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<Replenishment>> getAllReplenishments(
            @RequestParam(required = false) MovementType movementType,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return ResponseEntity.ok(replenishmentService.getAllReplenishments(movementType, productId, startDate, endDate));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get replenishment by id", description = "Get replenishment by id")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    public ResponseEntity<Replenishment> getReplenishmentById(@PathVariable Long id) {
        return ResponseEntity.ok(replenishmentService.getReplenishmentById(id));
    }

    @GetMapping("/movement-type/{type}")
    public ResponseEntity<List<Replenishment>> getReplenishmentsByMovementType(
            @PathVariable MovementType type) {
        return ResponseEntity.ok(replenishmentService.getReplenishmentsByMovementType(type));
    }
}
