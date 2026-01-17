package org.example.back.services;

import org.example.back.dtos.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface ReportService {
    List<PaymentMethodReportDTO> getPaymentMethodSalesReport(LocalDateTime startDate, LocalDateTime endDate);
    List<TopProductReportDTO> getTopSellingProductsReport(LocalDateTime startDate, LocalDateTime endDate);
    List<SalesByPeriodDTO> getSalesByPeriod(String periodType, LocalDateTime startDate, LocalDateTime endDate);
    List<CustomerStatisticsDTO> getCustomerStatistics(LocalDateTime startDate, LocalDateTime endDate);
    List<InventoryReportDTO> getInventoryReport(LocalDateTime startDate, LocalDateTime endDate);
    List<TopCustomerDTO> getTopCustomers(int limit);
    OrderStatisticsDTO getOrderStatistics(LocalDateTime startDate, LocalDateTime endDate);
    List<OrdersByStatusDTO> getOrdersByStatus(LocalDateTime startDate, LocalDateTime endDate);
    ConversionRateDTO getConversionRate(LocalDateTime startDate, LocalDateTime endDate);
    List<SalesByBrandDTO> getSalesByBrand(LocalDateTime startDate, LocalDateTime endDate);
    List<SalesByCategoryDTO> getSalesByCategory(LocalDateTime startDate, LocalDateTime endDate);
    List<ProductsWithoutMovementDTO> getProductsWithoutMovement(LocalDateTime startDate);
    List<ShippingMethodReportDTO> getShippingMethodReport(LocalDateTime startDate, LocalDateTime endDate);
}
