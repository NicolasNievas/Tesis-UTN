package org.example.back.models;

import lombok.*;
import org.example.back.entities.OrderStatus;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderRequest {
    private Long paymentMethodId;
    private Long shippingId;
    private String paymentId;
    private String mercadoPagoOrderId;
    private OrderStatus status;
    private List<OrderDetailRequest> details;
    private double transactionAmount;
    private String paymentMethodDetail;
}
