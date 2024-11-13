package org.example.back.models;

import lombok.*;
import org.example.back.enums.DeliveryStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatedDeliveryDetail {
    private Long productId;
    private String productName;
    private DeliveryStatus status;
    private Integer requestedQuantity;
    private Integer expectedQuantity;
    private Double finalPrice;
    private String statusMessage;
}
