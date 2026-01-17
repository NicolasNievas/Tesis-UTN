package org.example.back.initializer;

import lombok.RequiredArgsConstructor;
import org.example.back.entities.ShippingEntity;
import org.example.back.repositories.ShippingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class ShippingMethodInitializer implements CommandLineRunner {
    private final ShippingRepository shippingRepository;

    @Override
    public void run(String... args) {
        if (shippingRepository.count() == 0) {

            // Local Pickup - FREE
            ShippingEntity localPickup = new ShippingEntity();
            localPickup.setName("LOCAL_PICKUP");
            localPickup.setDisplayName("Store Pickup");
            localPickup.setBaseCost(BigDecimal.ZERO);
            localPickup.setDescription("Free pickup at our store from Monday to Friday, 9 AM to 6 PM");
            localPickup.setEstimatedDays(0);
            localPickup.setActive(true);
            localPickup.setRequiresPostalCode(false);
            localPickup.setCostPerKm(BigDecimal.ZERO);

            // OCA
            ShippingEntity oca = new ShippingEntity();
            oca.setName("OCA");
            oca.setDisplayName("OCA");
            oca.setBaseCost(new BigDecimal("1800.00"));
            oca.setDescription("Delivery in 2-4 business days");
            oca.setEstimatedDays(4);
            oca.setActive(true);
            oca.setRequiresPostalCode(true);
            oca.setCostPerKm(new BigDecimal("6.00"));

            // Argentine Mail
            ShippingEntity argentineMail = new ShippingEntity();
            argentineMail.setName("CORREO_ARGENTINO");
            argentineMail.setDisplayName("Argentine Mail");
            argentineMail.setBaseCost(new BigDecimal("1200.00"));
            argentineMail.setDescription("Delivery in 4-7 business days");
            argentineMail.setEstimatedDays(7);
            argentineMail.setActive(true);
            argentineMail.setRequiresPostalCode(true);
            argentineMail.setCostPerKm(new BigDecimal("4.50"));

            // Andreani (NEW)
            ShippingEntity andreani = new ShippingEntity();
            andreani.setName("ANDREANI");
            andreani.setDisplayName("Andreani");
            andreani.setBaseCost(new BigDecimal("1500.00"));
            andreani.setDescription("Delivery in 3-5 business days");
            andreani.setEstimatedDays(5);
            andreani.setActive(true);
            andreani.setRequiresPostalCode(true);
            andreani.setCostPerKm(new BigDecimal("5.00"));

            shippingRepository.saveAll(Arrays.asList(
                    localPickup,
                    oca,
                    argentineMail,
                    andreani
            ));

            System.out.println("✓ Shipping methods initialized successfully");
        }
    }
}