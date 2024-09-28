package org.example.back.models;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Product {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private List<String> imageUrls;
    private Integer stock;
    private boolean active;
    private Long brandId;
    private Long categoryId;
}
