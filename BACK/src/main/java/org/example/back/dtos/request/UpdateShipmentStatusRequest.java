package org.example.back.dtos.request;

import lombok.*;
import org.example.back.enums.ShipmentStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateShipmentStatusRequest {
    private ShipmentStatus status;
    private String location;
    private String description;
}
