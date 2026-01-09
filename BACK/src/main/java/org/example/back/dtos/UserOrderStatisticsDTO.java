package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserOrderStatisticsDTO {
    private Long totalOrders;
    private BigDecimal totalSpent;
    private Long pendingOrders;
    private Long completedOrders;
    private Long inProcessOrders;
    private Long cancelledOrders;
}
