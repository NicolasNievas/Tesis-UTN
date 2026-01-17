package org.example.back.dtos;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShippingAddressDTO {
    private String address;
    private String city;
    private String postalCode;
}
