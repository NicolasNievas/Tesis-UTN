package org.example.back.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutDTO {
    private CartDTO cart;
    private List<ShippingDTO> availableShippingMethods;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal total;
    private ShippingAddressDTO shippingAddress;
}
