package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductReportDTO {
    private String productName;
    private Long totalQuantity;
    private BigDecimal totalSales;
}
