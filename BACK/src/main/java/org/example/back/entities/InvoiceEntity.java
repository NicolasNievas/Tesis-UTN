package org.example.back.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.back.enums.OrderStatus;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "invoice")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private ProviderEntity provider;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double totalEntered;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<InvoiceDetailEntity> invoiceDetails;

    @OneToOne
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrderEntity purchaseOrder;
}
