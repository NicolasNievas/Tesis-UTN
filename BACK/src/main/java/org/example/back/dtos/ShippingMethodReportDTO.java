package org.example.back.dtos;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShippingMethodReportDTO {
    private String shippingMethod;
    private Long orderCount;
    private BigDecimal totalSales;
    private BigDecimal averageShippingCost;
}
