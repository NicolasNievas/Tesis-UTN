package org.example.back.dtos;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShippingDTO {
    private Long id;
    private String name;
    private String displayName;
    private BigDecimal baseCost;
    private String description;
    private Integer estimatedDays;
    private Boolean requiresPostalCode;
}
