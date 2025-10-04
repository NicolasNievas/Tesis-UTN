package org.example.back.entities;

import jakarta.persistence.*;
import lombok.*;
import org.example.back.enums.OrderStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoice")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class InvoiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id")
    private ProviderEntity provider;

    @ToString.Include
    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double totalEntered;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoiceDetailEntity> invoiceDetails = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrderEntity purchaseOrder;
}
