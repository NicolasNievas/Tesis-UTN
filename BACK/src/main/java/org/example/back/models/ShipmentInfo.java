package org.example.back.models;

import lombok.*;
import org.example.back.enums.ShipmentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShipmentInfo {
    private Long shipmentId;
    private String trackingCode;
    private ShipmentStatus shipmentStatus;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime deliveredAt;
    private boolean hasShipment;
}
