package org.example.back.models;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryConfirmationDetail {
    private Long productId;
    private Integer receivedQuantity;
}
