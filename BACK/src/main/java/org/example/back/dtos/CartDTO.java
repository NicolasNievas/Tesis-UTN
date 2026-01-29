package org.example.back.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartDTO {
    private Long id;
    private Long userId;
    private List<CartItemDTO> items;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal total;
    private Long selectedShippingId;
    private ShippingDTO selectedShipping;
    private ShippingAddressDTO shippingAddress;
}
