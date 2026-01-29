package org.example.back.dtos.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.example.back.enums.ShipmentStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShipmentResponse {
    private Long id;
    private Long orderId;
    private String trackingCode;
    private ShipmentStatus status;
    private String carrier;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime shippedAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime estimatedDeliveryDate;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deliveredAt;
    private String recipientName;
    private String recipientAddress;
    private String recipientCity;
    private String recipientPostalCode;
    private String recipientPhone;
    private String notes;
    private List<ShipmentTrackingResponse> trackingHistory;
}
