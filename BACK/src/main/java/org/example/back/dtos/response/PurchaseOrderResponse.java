package org.example.back.dtos.response;

import lombok.*;
import org.example.back.enums.OrderStatus;
import org.example.back.models.SimulatedDeliveryDetail;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    private Long orderId;
    private LocalDate orderDate;
    private OrderStatus status;
    private Integer expectedDeliveryDays;
    private List<SimulatedDeliveryDetail> simulatedDelivery;
}
