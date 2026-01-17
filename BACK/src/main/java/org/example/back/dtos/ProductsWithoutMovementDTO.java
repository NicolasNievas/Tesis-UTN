package org.example.back.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
//@AllArgsConstructor
@Builder
public class ProductsWithoutMovementDTO {
    private Long productId;
    private String productName;
    private Integer stock;
    private BigDecimal price;
    private BigDecimal inventoryValue;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastMovementDate;
    private Integer totalSold;

    public ProductsWithoutMovementDTO(Long productId, String productName, Integer stock,
                                      BigDecimal price, BigDecimal inventoryValue,
                                      LocalDateTime lastMovementDate, Integer totalSold) {
        this.productId = productId;
        this.productName = productName;
        this.stock = stock;
        this.price = price;
        this.inventoryValue = inventoryValue;
        this.lastMovementDate = lastMovementDate;
        this.totalSold = totalSold;
    }
}
