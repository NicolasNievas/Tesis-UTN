package org.example.back.dtos.request;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateShipmentRequest {
    private Long orderId;
    private String notes;
}
