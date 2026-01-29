package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReportDTO {
    private Long productId;
    private String productName;
    private Integer currentStock;
    private BigDecimal price;
    private BigDecimal inventoryValue;
    private Long totalSold;
    private BigDecimal totalRevenue;
    private String stockStatus;
    private BigDecimal turnoverRate;
}
