package org.example.back.dtos.response;

import lombok.*;
import org.example.back.models.DeliverySimulationDetail;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatedDeliveryResponse {
    private Long invoiceId;
    private Integer delayDays;
    private List<DeliverySimulationDetail> details;
}
