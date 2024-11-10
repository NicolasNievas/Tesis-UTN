package org.example.back.models;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderOrderDetail {
    private Long productId;
    private Integer requestedQuantity;
    private Double purchasePrice;
}