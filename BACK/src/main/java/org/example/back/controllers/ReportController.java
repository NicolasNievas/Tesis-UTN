package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.*;
import org.example.back.services.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/reports/payment-methods")
    @Operation(summary = "Get payment method report", description = "Get the sales report by payment method")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<PaymentMethodReportDTO>> getPaymentMethodReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return ResponseEntity.ok(reportService.getPaymentMethodSalesReport(startDate, endDate));
    }

    @GetMapping("/reports/top-selling-products")
    @Operation(summary = "Get top selling products report", description = "Get the top selling products report")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<TopProductReportDTO>> getTopProductsReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return ResponseEntity.ok(reportService.getTopSellingProductsReport(startDate, endDate));
    }

    @GetMapping("/reports/salesByPeriod")
    @Operation(summary = "Get sales by period report", description = "Get the sales report grouped by period")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<SalesByPeriodDTO>> getSalesByPeriod(
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (!List.of("day", "week", "month", "year").contains(period.toLowerCase())) {
            throw new IllegalArgumentException("Invalid period. Allowed values are: day, week, month, year.");
        }

        if(startDate == null){
            startDate = LocalDateTime.now().minusMonths(1);
        }

        if (endDate == null){
            endDate = LocalDateTime.now();
        }
        return ResponseEntity.ok(reportService.getSalesByPeriod(period, startDate, endDate));
    }

    @GetMapping("/reports/customer-statistics")
    @Operation(
            summary = "Get customer statistics",
            description = "Get detailed statistics for all customers"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<CustomerStatisticsDTO>> getCustomerStatistics(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusYears(1); // Último año por defecto
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getCustomerStatistics(startDate, endDate));
    }

    @GetMapping("/reports/top-customers")
    @Operation(
            summary = "Get top customers",
            description = "Get the top customers by total spent (only completed orders)"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "400", description = "Invalid limit parameter")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "No data found")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<TopCustomerDTO>> getTopCustomers(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(reportService.getTopCustomers(limit));
    }

    @GetMapping("/reports/inventory")
    @Operation(summary = "Get inventory report", description = "GGet current inventory status with sales data")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    public ResponseEntity<List<InventoryReportDTO>> getInventoryReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(3); // Últimos 3 meses por defecto
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getInventoryReport(startDate, endDate));
    }

    @GetMapping("/reports/order-statistics")
    @Operation(
            summary = "Get order statistics",
            description = "Get average ticket and order statistics"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<OrderStatisticsDTO> getOrderStatistics(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getOrderStatistics(startDate, endDate));
    }

    @GetMapping("/reports/orders-by-status")
    @Operation(
            summary = "Get orders by status",
            description = "Get distribution of orders by status"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<OrdersByStatusDTO>> getOrdersByStatus(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getOrdersByStatus(startDate, endDate));
    }

    @GetMapping("/reports/conversion-rate")
    @Operation(
            summary = "Get conversion rate",
            description = "Get conversion rate (completed vs cancelled orders)"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<ConversionRateDTO> getConversionRate(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getConversionRate(startDate, endDate));
    }

    @GetMapping("/reports/sales-by-brand")
    @Operation(
            summary = "Get sales by brand",
            description = "Get sales statistics grouped by brand"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<SalesByBrandDTO>> getSalesByBrand(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getSalesByBrand(startDate, endDate));
    }

    @GetMapping("/reports/sales-by-category")
    @Operation(
            summary = "Get sales by category",
            description = "Get sales statistics grouped by category and brand"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<SalesByCategoryDTO>> getSalesByCategory(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getSalesByCategory(startDate, endDate));
    }

    @GetMapping("/reports/products-without-movement")
    @Operation(
            summary = "Get products without movement",
            description = "Get products that haven't been sold since the specified date"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<?> getProductsWithoutMovement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(defaultValue = "false") Boolean includeZeroStock
    ) {
        List<ProductsWithoutMovementDTO> products = reportService.getProductsWithoutMovement(startDate);

        List<ProductsWithoutMovementDTO> filteredProducts = products.stream()
                .filter(p -> minStock == null || p.getStock() >= minStock)
                .filter(p -> maxStock == null || p.getStock() <= maxStock)
                .filter(p -> includeZeroStock || p.getStock() > 0)
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredProducts);
    }

    @GetMapping("/reports/shipping-methods")
    @Operation(
            summary = "Get shipping method report",
            description = "Get statistics about shipping methods usage"
    )
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    public ResponseEntity<List<ShippingMethodReportDTO>> getShippingMethodReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(reportService.getShippingMethodReport(startDate, endDate));
    }
}
