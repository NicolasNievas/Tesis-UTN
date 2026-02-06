package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.*;
import org.example.back.repositories.OrderRepository;
import org.example.back.repositories.ReportRepository;
import org.example.back.services.ReportService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImp implements ReportService {
    private final OrderRepository orderRepository;
    private final ReportRepository reportRepository;

    @Override
    public List<PaymentMethodReportDTO> getPaymentMethodSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = orderRepository.getPaymentMethodSalesReport(startDate, endDate);
        return results.stream()
                .map(row -> new PaymentMethodReportDTO(
                        (String) row[0],
                        (Long) row[1],
                        new BigDecimal(row[2].toString())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopProductReportDTO> getTopSellingProductsReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = orderRepository.getTopSellingProductsReport(startDate, endDate);
        return results.stream()
                .map(row -> new TopProductReportDTO(
                        (String) row[0],
                        (Long) row[1],
                        new BigDecimal(row[2].toString())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<SalesByPeriodDTO> getSalesByPeriod(String periodType, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> result = reportRepository.getSalesByPeriod(periodType, startDate, endDate);

        if (result.isEmpty()){
            throw new IllegalArgumentException("No sales data found for the specified period.");
        }

        return result.stream()
                .map(row -> {
                    // Convertir Timestamp a LocalDateTime
                    LocalDateTime period;
                    if (row[0] instanceof java.sql.Timestamp) {
                        period = ((java.sql.Timestamp) row[0]).toLocalDateTime();
                    } else if (row[0] instanceof LocalDateTime) {
                        period = (LocalDateTime) row[0];
                    } else {
                        throw new IllegalStateException("Unexpected type for period: " + row[0].getClass());
                    }

                    return new SalesByPeriodDTO(
                            period,
                            ((Number) row[1]).longValue(),
                            new BigDecimal(row[2].toString())
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<CustomerStatisticsDTO> getCustomerStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getCustomerStatistics(startDate, endDate);

        if (results.isEmpty()){
            throw new IllegalArgumentException("No customer data found for the specified period.");
        }

        return results.stream()
                .map(row -> new CustomerStatisticsDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).longValue(),
                        new BigDecimal(row[5].toString()),
                        new BigDecimal(row[6].toString()),
                        (LocalDateTime) row[7]
                ))
                .collect(Collectors.toList());
    }

    // En ReportServiceImp.java
    @Override
    public List<InventoryReportDTO> getInventoryReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getInventoryReport(startDate, endDate);

        return results.stream()
                .map(row -> {
                    InventoryReportDTO dto = new InventoryReportDTO();
                    dto.setProductId(((Number) row[0]).longValue());
                    dto.setProductName((String) row[1]);
                    dto.setCurrentStock(((Number) row[2]).intValue());
                    dto.setPrice((BigDecimal) row[3]);
                    dto.setInventoryValue((BigDecimal) row[4]);
                    dto.setTotalSold(((Number) row[5]).longValue());
                    dto.setTotalRevenue((BigDecimal) row[6]);
                    dto.setStockStatus((String) row[7]);
                    dto.setTurnoverRate((BigDecimal) row[8]);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TopCustomerDTO> getTopCustomers(int limit) {
        if (limit <= 0) {
            throw new IllegalArgumentException("Limit must be greater than 0");
        }

        if (limit > 100) {
            throw new IllegalArgumentException("Limit cannot exceed 100");
        }

        List<Object[]> results = reportRepository.getTopCustomers(limit);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No customer data found. There might be no completed orders yet.");
        }

        return results.stream()
                .map(row -> new TopCustomerDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        new BigDecimal(row[3].toString())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public OrderStatisticsDTO getOrderStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getOrderStatistics(startDate, endDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No order data found for the specified period.");
        }

        Object[] row = results.get(0);
        return new OrderStatisticsDTO(
                ((Number) row[0]).longValue(),
                row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO,
                row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO,
                row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO
        );
    }

    @Override
    public List<OrdersByStatusDTO> getOrdersByStatus(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getOrdersByStatus(startDate, endDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No order data found for the specified period.");
        }

        return results.stream()
                .map(row -> new OrdersByStatusDTO(
                        row[0].toString(),
                        ((Number) row[1]).longValue(),
                        new BigDecimal(row[2].toString())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public ConversionRateDTO getConversionRate(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getConversionRate(startDate, endDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No order data found for the specified period.");
        }

        Object[] row = results.get(0);
        return new ConversionRateDTO(
                ((Number) row[0]).longValue(),
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue(),
                ((Number) row[3]).longValue()
        );
    }

    @Override
    public List<SalesByBrandDTO> getSalesByBrand(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getSalesByBrand(startDate, endDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No sales data found for the specified period.");
        }

        return results.stream()
                .map(row -> new SalesByBrandDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        ((Number) row[3]).longValue(),
                        new BigDecimal(row[4].toString())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<SalesByCategoryDTO> getSalesByCategory(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getSalesByCategory(startDate, endDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No sales data found for the specified period.");
        }

        return results.stream()
                .map(row -> new SalesByCategoryDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue(),
                        ((Number) row[4]).longValue(),
                        new BigDecimal(row[5].toString())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductsWithoutMovementDTO> getProductsWithoutMovement(LocalDateTime startDate) {
        // Si no se proporciona fecha, usar los últimos 6 meses por defecto
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(6);
        }

        // Validar que la fecha no sea futura
        if (startDate.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser futura");
        }

        List<Object[]> results = reportRepository.getProductsWithoutMovement(startDate);

        return results.stream()
                .map(this::mapToDTO)
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(
                        ProductsWithoutMovementDTO::getLastMovementDate,
                        Comparator.nullsFirst(Comparator.naturalOrder())
                ))
                .collect(Collectors.toList());
    }

    private ProductsWithoutMovementDTO mapToDTO(Object[] row) {
        try {
            Long productId = ((Number) row[0]).longValue();
            String productName = (String) row[1];
            Integer stock = ((Number) row[2]).intValue();
            BigDecimal price = new BigDecimal(row[3].toString());
            BigDecimal inventoryValue = new BigDecimal(row[4].toString());

            // Manejo seguro de la fecha
            LocalDateTime lastMovementDate = null;
            if (row[5] != null) {
                if (row[5] instanceof Timestamp) {
                    Timestamp timestamp = (Timestamp) row[5];
                    lastMovementDate = timestamp.toLocalDateTime();
                } else if (row[5] instanceof java.util.Date) {
                    java.util.Date date = (java.util.Date) row[5];
                    lastMovementDate = date.toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                } else if (row[5] instanceof LocalDateTime) {
                    lastMovementDate = (LocalDateTime) row[5];
                }
            }

            Integer totalSold = row.length > 6 && row[6] != null
                    ? ((Number) row[6]).intValue()
                    : 0;

            return new ProductsWithoutMovementDTO(
                    productId,
                    productName,
                    stock,
                    price,
                    inventoryValue,
                    lastMovementDate,
                    totalSold
            );

        } catch (Exception e) {
            return null;
        }
    }

    // Método para calcular días sin movimiento
    public List<Map<String, Object>> getProductsWithoutMovementWithAnalysis(LocalDateTime startDate) {
        List<ProductsWithoutMovementDTO> products = getProductsWithoutMovement(startDate);

        return products.stream()
                .map(product -> {
                    Map<String, Object> analysis = new HashMap<>();
                    analysis.put("product", product);

                    // Calcular días sin movimiento
                    if (product.getLastMovementDate() != null) {
                        long days = ChronoUnit.DAYS.between(
                                product.getLastMovementDate().toLocalDate(),
                                LocalDate.now()
                        );
                        analysis.put("daysWithoutMovement", days);

                        // Categorizar
                        if (product.getStock() == 0) {
                            analysis.put("category", "SIN_STOCK");
                        } else if (days > 180) {
                            analysis.put("category", "INVENTARIO_OBSOLETO");
                        } else if (days > 90) {
                            analysis.put("category", "MOVIMIENTO_LENTO");
                        } else {
                            analysis.put("category", "NORMAL");
                        }
                    } else {
                        analysis.put("daysWithoutMovement", null);
                        analysis.put("category", "SIN_MOVIMIENTO_REGISTRADO");
                    }

                    return analysis;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ShippingMethodReportDTO> getShippingMethodReport(LocalDateTime startDate, LocalDateTime endDate) {
        try {

            if (startDate.isAfter(endDate)) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }

            List<Object[]> results = reportRepository.getShippingMethodReport(startDate, endDate);

            if (results.isEmpty()) {
                throw new IllegalArgumentException("No shipping data found for the specified period.");
            }

            return results.stream()
                    .map(row -> {
                        try {
                            return new ShippingMethodReportDTO(
                                    (String) row[0], // shippingMethod
                                    row[1] != null ? ((Number) row[1]).longValue() : 0L,
                                    row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO,
                                    row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO
                            );
                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error generating shipping method report: " + e.getMessage(), e);
        }
    }

    @Override
    public List<MonthlyTrendsDTO> getMonthlyTrends(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getTTMonthSales(startDate, endDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No monthly trends data found for the specified period.");
        }

        return results.stream()
                .map(row -> {
                    String month = (String) row[0]; // Formato YYYY-MM
                    Long orderCount = ((Number) row[1]).longValue();
                    BigDecimal totalSales = new BigDecimal(row[2].toString());
                    BigDecimal averageTicket = new BigDecimal(row[3].toString());

                    return new MonthlyTrendsDTO(month, orderCount, totalSales, averageTicket);
                })
                .collect(Collectors.toList());
    }

    @Override
    public TopProductByPeriodDTO getTopProductByPeriod(String periodType, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getTopProductByPeriod(periodType, startDate, endDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No top product data found for the specified period.");
        }

        Object[] row = results.get(0);
        TopProductByPeriodDTO dto = new TopProductByPeriodDTO();
        dto.setProductId(((Number) row[0]).longValue());
        dto.setProductName((String) row[1]);
        dto.setTotalQuantity(((Number) row[2]).longValue());
        dto.setTotalSales(new BigDecimal(row[3].toString()));

        if (row[4] instanceof java.sql.Timestamp) {
            dto.setPeriod(((java.sql.Timestamp) row[4]).toLocalDateTime());
        } else if (row[4] instanceof LocalDateTime) {
            dto.setPeriod((LocalDateTime) row[4]);
        }

        dto.setPeriodType(periodType);

        return dto;
    }
}
