package org.example.back.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "providers")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class ProviderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ToString.Include
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String street;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    void onCreate() {
        if (isActive == null) this.isActive = true;
    }
}

