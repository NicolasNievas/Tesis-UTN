package org.example.back.dtos.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.example.back.enums.ShipmentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShipmentTrackingResponse {
    private Long id;
    private ShipmentStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    private String location;
    private String description;
}
