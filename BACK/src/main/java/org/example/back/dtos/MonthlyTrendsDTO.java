package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendsDTO {
    private String month;
    private Long orderCount;
    private BigDecimal totalSales;
    private BigDecimal averageTicket;
}
