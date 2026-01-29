package org.example.back.dtos.request;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateShippingRequest {
    private Long shippingMethodId;
    private String address;
    private String city;
    private String postalCode;
}
