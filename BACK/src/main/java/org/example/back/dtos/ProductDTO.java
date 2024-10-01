package org.example.back.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private List<String> imageUrl;
    private Integer stock;
    private BrandDTO brand;
    private CategoryDTO category;
    //private ProviderDTO provider;
}
