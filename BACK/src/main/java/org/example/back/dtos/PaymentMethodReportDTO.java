package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethodReportDTO {
    private String paymentMethod;
    private Long orderCount;
    private BigDecimal totalSales;
}
