package org.example.back.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.back.enums.ShipmentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShipmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(nullable = false, unique = true, length = 50)
    private String trackingCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime shippedAt; // Cuando se envio

    @Column
    private LocalDateTime estimatedDeliveryDate; // Fecha estimada

    @Column
    private LocalDateTime deliveredAt; // Cuando se entrego

    @Column(length = 1000)
    private String notes;

    @Column
    private String carrier; // OCA, ANDREANI, CORREO_ARGENTINO, LOCAL_PICKUP

    @Column(length = 500)
    private String recipientName;

    @Column(length = 500)
    private String recipientAddress;

    @Column(length = 100)
    private String recipientCity;

    @Column(length = 20)
    private String recipientPostalCode;

    @Column(length = 50)
    private String recipientPhone;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ShipmentStatus.PENDING;
        }
    }
}
