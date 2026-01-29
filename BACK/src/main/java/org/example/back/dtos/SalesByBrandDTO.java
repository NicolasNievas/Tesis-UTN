package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesByBrandDTO {
    private Long brandId;
    private String brandName;
    private Long itemsSold;
    private Long totalQuantity;
    private BigDecimal totalSales;
}
