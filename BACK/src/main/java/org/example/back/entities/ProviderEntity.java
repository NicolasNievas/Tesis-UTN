package org.example.back.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "providers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProviderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String street;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    private List<ProductEntity> products;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    private List<InvoiceEntity> invoices;
}
