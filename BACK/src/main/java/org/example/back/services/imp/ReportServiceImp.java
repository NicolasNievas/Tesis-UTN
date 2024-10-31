package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.PaymentMethodReportDTO;
import org.example.back.dtos.ProductSalesDTO;
import org.example.back.dtos.TopProductReportDTO;
import org.example.back.repositories.OrderRepository;
import org.example.back.services.ReportService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImp implements ReportService {
    private final OrderRepository orderRepository;

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
}
