package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.entities.ProviderEntity;
import org.example.back.models.Provider;
import org.example.back.repositories.ProviderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.back.services.ProviderService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderServiceImp implements ProviderService {
    private final ProviderRepository providerRepository;

    @Override
    @Transactional
    public List<Provider> getAllProviders() {
        List<ProviderEntity> providerEntities = providerRepository.findAll();
        return providerEntities.stream()
                .map(providerEntity -> Provider.builder()
                        .id(providerEntity.getId())
                        .name(providerEntity.getName())
                        .email(providerEntity.getEmail())
                        .phone(providerEntity.getPhone())
                        .street(providerEntity.getStreet())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public Provider getProviderById(Long id) {;
        ProviderEntity providerEntity = providerRepository.findById(id).orElse(null);
        if (providerEntity == null || providerEntity.getId() == null) {
            IllegalArgumentException e = new IllegalArgumentException("Provider not found with id: " + id);
        }

        return Provider.builder()
                .id(providerEntity.getId())
                .name(providerEntity.getName())
                .email(providerEntity.getEmail())
                .phone(providerEntity.getPhone())
                .street(providerEntity.getStreet())
                .build();
    }
}
