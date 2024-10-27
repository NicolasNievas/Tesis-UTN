package org.example.back.models;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerInfo {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
}
