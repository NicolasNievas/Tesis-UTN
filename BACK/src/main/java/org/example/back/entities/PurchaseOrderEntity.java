package org.example.back.entities;

import jakarta.persistence.*;
import lombok.*;
import org.example.back.enums.OrderStatus;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseOrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private ProviderEntity provider;

    @Column(nullable = false)
    private LocalDate orderDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL)
    private List<PurchaseOrderDetailEntity> orderDetails;

    @OneToOne(mappedBy = "purchaseOrder")
    private InvoiceEntity invoice;

    @Column
    private Integer expectedDeliveryDays;

    public PurchaseOrderEntity(Long providerId, LocalDate now, OrderStatus orderStatus) {
    }
}
