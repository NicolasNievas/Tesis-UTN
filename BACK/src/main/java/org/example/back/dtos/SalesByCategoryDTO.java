package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesByCategoryDTO {
    private Long categoryId;
    private String categoryName;
    private String brandName;
    private Long itemsSold;
    private Long totalQuantity;
    private BigDecimal totalSales;
}
