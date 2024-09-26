package org.example.back.models;

import lombok.*;
import org.example.back.entities.MovementType;

import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Replenishment {
    private Long id;
    private LocalDateTime date;
    private Integer quantity;
    private Product product;
    private MovementType movementType;
}
