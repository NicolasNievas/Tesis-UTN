package org.example.back.dtos;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductSalesDTO {
    private Long productId;
    private String productName;
    private String categoryName;
    private Long totalQuantity;
    private BigDecimal totalRevenue;
}
