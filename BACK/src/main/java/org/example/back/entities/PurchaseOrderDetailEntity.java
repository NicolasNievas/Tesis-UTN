package org.example.back.entities;

import jakarta.persistence.*;
import lombok.*;
import org.example.back.enums.DeliveryStatus;

@Entity
@Table(name = "purchase_order_details")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseOrderDetailEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(nullable = false)
    private Integer requestedQuantity;

    @Column(nullable = false)
    private Double requestedPrice;

    @Column
    private Double finalPrice;

    @Column
    private Integer simulatedReceivedQuantity;

    @Enumerated(EnumType.STRING)
    @Column
    private DeliveryStatus simulatedStatus;
}
