package org.example.back.services;

import org.example.back.dtos.PaymentMethodReportDTO;
import org.example.back.dtos.TopProductReportDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface ReportService {
    List<PaymentMethodReportDTO> getPaymentMethodSalesReport(LocalDateTime startDate, LocalDateTime endDate);
    List<TopProductReportDTO> getTopSellingProductsReport(LocalDateTime startDate, LocalDateTime endDate);
}
