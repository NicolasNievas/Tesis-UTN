package org.example.back.models;

import lombok.*;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Provider {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String street;
    private Boolean isActive = true;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
}
