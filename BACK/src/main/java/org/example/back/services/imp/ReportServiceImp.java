package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.*;
import org.example.back.repositories.OrderRepository;
import org.example.back.repositories.ReportRepository;
import org.example.back.services.ReportService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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

    @Override
    public List<InventoryReportDTO> getInventoryReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = reportRepository.getInventoryReport(startDate, endDate);

        if (results.isEmpty()){
            throw new IllegalArgumentException("No inventory data found for the specified period.");
        }

        return results.stream()
                .map(row -> new InventoryReportDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).intValue(),
                        new BigDecimal(row[3].toString()),
                        new BigDecimal(row[4].toString()),
                        ((Number) row[5]).longValue(),
                        (String) row[6]
                ))
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
        List<Object[]> results = reportRepository.getProductsWithoutMovement(startDate);

        if (results.isEmpty()) {
            throw new IllegalArgumentException("No products without movement found for the specified period.");
        }

        return results.stream()
                .map(row -> {
                    LocalDateTime lastMovementDate = null;
                    if (row[5] != null) {
                        if (row[5] instanceof java.sql.Timestamp) {
                            lastMovementDate = ((java.sql.Timestamp) row[5]).toLocalDateTime();
                        } else if (row[5] instanceof LocalDateTime) {
                            lastMovementDate = (LocalDateTime) row[5];
                        }
                    }

                    return new ProductsWithoutMovementDTO(
                            ((Number) row[0]).longValue(),
                            (String) row[1],
                            ((Number) row[2]).intValue(),
                            new BigDecimal(row[3].toString()),
                            new BigDecimal(row[4].toString()),
                            lastMovementDate
                    );
                })
                .collect(Collectors.toList());
    }
}
