package org.example.back.initializer;

import lombok.RequiredArgsConstructor;
import org.example.back.entities.ProviderEntity;
import org.example.back.repositories.ProviderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProviderInitializer implements CommandLineRunner {
    private final ProviderRepository providerRepository;

    @Override
    public void run(String... args) {
        if (providerRepository.count() == 0) {
            List<ProviderEntity> defaultProviders = Arrays.asList(
                    createProvider(
                            "Café Importadora Argentina",
                            "ventas@cafeia.com.ar",
                            "+54 11 4444-5555",
                            "Av. Corrientes 1234, CABA"
                    ),
                    createProvider(
                            "Distribuidora de Café Premium",
                            "contacto@dcpremium.com.ar",
                            "+54 11 5555-6666",
                            "Av. Juan B. Justo 5678, CABA"
                    ),
                    createProvider(
                            "Coffee Beans Wholesaler",
                            "orders@cbw.com.ar",
                            "+54 11 6666-7777",
                            "Av. Cabildo 2468, CABA"
                    )
            );

            providerRepository.saveAll(defaultProviders);
        }
    }

    private ProviderEntity createProvider(String name, String email, String phone, String street) {
        ProviderEntity provider = new ProviderEntity();
        provider.setName(name);
        provider.setEmail(email);
        provider.setPhone(phone);
        provider.setStreet(street);
        return provider;
    }
}
