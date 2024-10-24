package org.example.back.initializer;

import lombok.RequiredArgsConstructor;
import org.example.back.entities.ShippingEntity;
import org.example.back.repositories.ShippingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class ShippingMethodInitializer implements CommandLineRunner{
    private final ShippingRepository shippingRepository;

    @Override
    public void run(String... args) {
        if (shippingRepository.count() == 0) {
            ShippingEntity localPickup = new ShippingEntity();
            localPickup.setName("LOCAL_PICKUP");

            ShippingEntity homeDelivery = new ShippingEntity();
            homeDelivery.setName("HOME_DELIVERY");

            shippingRepository.saveAll(Arrays.asList(localPickup, homeDelivery));
        }
    }
}
