package org.example.back.dtos.response;

import lombok.*;
import org.example.back.enums.OrderStatus;
import org.example.back.models.CustomerInfo;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private LocalDateTime date;
    private OrderStatus status;
    private String paymentMethodName;
    private String shippingName;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal total;
    private String paymentId;
    private String mercadoPagoOrderId;
    private CustomerInfo customer;
    private List<OrderDetailResponse> details;
    private String shippingAddress;
    private String shippingCity;
    private String shippingPostalCode;
}
