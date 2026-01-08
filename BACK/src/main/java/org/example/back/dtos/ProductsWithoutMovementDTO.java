package org.example.back.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductsWithoutMovementDTO {
    private Long productId;
    private String productName;
    private Integer stock;
    private BigDecimal price;
    private BigDecimal inventoryValue;
    private LocalDateTime lastMovementDate;
}
