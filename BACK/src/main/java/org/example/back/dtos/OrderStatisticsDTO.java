package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatisticsDTO {
    private Long totalOrders;
    private BigDecimal averageTicket;
    private BigDecimal maxTicket;
    private BigDecimal minTicket;
}
