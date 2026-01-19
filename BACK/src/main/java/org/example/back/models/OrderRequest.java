package org.example.back.models;

import lombok.*;
import org.example.back.enums.OrderStatus;

import java.math.BigDecimal;
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
    private BigDecimal shippingCost;
    private String shippingAddress;
    private String shippingCity;
    private String shippingPostalCode;
    private BigDecimal subtotal;
    private BigDecimal total;
}
