package org.example.back.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "shipping")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShippingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // "OCA", "CORREO_ARGENTINO", "LOCAL_PICKUP"

    @Column(nullable = false)
    private String displayName; // "OCA", "Correo Argentino", "Retiro en local"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCost; // Costo base (0 para retiro local)

    @Column(length = 500)
    private String description; // "Entrega en 3-5 días hábiles"

    @Column(nullable = false)
    private Boolean active = true;

    @Column
    private Integer estimatedDays;

    @Column(precision = 10, scale = 2)
    private BigDecimal costPerKm;

    @Column
    private Boolean requiresPostalCode = false;
}
