package org.example.back.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.back.enums.DeliveryStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeliverySimulationDetail {
    private Long productId;
    private Integer receivedQuantity;
    private DeliveryStatus status;
    private Double finalPrice;
}
