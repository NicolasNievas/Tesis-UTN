package org.example.back.models;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDetailRequest {
    private Long productId;
    private Integer quantity;
    private BigDecimal price;
}
