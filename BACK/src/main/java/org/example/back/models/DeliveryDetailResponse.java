package org.example.back.models;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDetailResponse {
    private Long productId;
    private String productName;
    private Integer requestedQuantity;
    private Integer receivedQuantity;
    private Double finalPrice;
    private Integer variance; // Diferencia entre lo pedido y recibido
}
