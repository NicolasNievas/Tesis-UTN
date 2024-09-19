package org.example.back.models;

import lombok.*;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Brand {
    private Long id;
    private String name;
    private boolean active;
}
