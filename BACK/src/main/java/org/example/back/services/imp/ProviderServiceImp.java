package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.example.back.dtos.common.InvalidOperationException;
import org.example.back.dtos.request.ProviderRequest;
import org.example.back.entities.ProviderEntity;
import org.example.back.entities.UserEntity;
import org.example.back.models.Provider;
import org.example.back.models.User;
import org.example.back.repositories.ProviderRepository;
import org.example.back.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.back.services.ProviderService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderServiceImp implements ProviderService {
    private final ProviderRepository providerRepository;
    private final UserService userService;

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
                        .isActive(providerEntity.getIsActive())
                        .createdBy(providerEntity.getCreatedBy())
                        .updatedBy(providerEntity.getUpdatedBy())
                        .deletedBy(providerEntity.getDeletedBy())
                        .createdAt(providerEntity.getCreatedAt())
                        .updatedAt(providerEntity.getUpdatedAt())
                        .deletedAt(providerEntity.getDeletedAt())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public Provider getProviderById(Long id) {;
        ProviderEntity entity = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));

        return mapToProvider(entity);
    }

    @Override
    @Transactional
    public Provider createProvider(ProviderRequest req) {

        if (providerRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + req.getEmail());
        }

        ProviderEntity entity = new ProviderEntity();
        applyRequest(entity, req);
        entity.setIsActive(true);
        ProviderEntity saved = providerRepository.save(entity);
        return mapToProvider(saved);
    }

    @Override
    @Transactional
    public Provider updateProvider(Long id, ProviderRequest req) {
        ProviderEntity entity = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));

        if (providerRepository.existsByEmailIgnoreCaseAndIdNot(req.getEmail(), id)) {
            throw new IllegalArgumentException("Email is already in use: " + req.getEmail());
        }

        applyRequest(entity, req);
        ProviderEntity saved = providerRepository.save(entity);
        return mapToProvider(saved);
    }

    @Override
    @Transactional
    public Provider deleteProvider(Long id) {
        ProviderEntity entity = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));
        if (Boolean.FALSE.equals(entity.getIsActive())) {
            return mapToProvider(entity);
        }
        entity.setIsActive(false);
        entity.setDeletedAt(LocalDateTime.now());
        //entity.setDeletedBy(currentUsernameOrSystem());
        ProviderEntity saved = providerRepository.save(entity);
        return mapToProvider(saved);
    }

    @Override
    @Transactional
    public Provider reactivateProvider(Long id) {
        ProviderEntity entity = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));
        if (Boolean.TRUE.equals(entity.getIsActive())) {
            throw new InvalidOperationException("Provider with id " + id + " is already active");
        }
        entity.setIsActive(true);
        entity.setDeletedAt(null);
        entity.setDeletedBy(null);
        ProviderEntity saved = providerRepository.save(entity);
        return mapToProvider(saved);
    }

    private void applyRequest(ProviderEntity entity, ProviderRequest req) {
        entity.setName(req.getName().trim());
        entity.setEmail(req.getEmail().trim().toLowerCase());
        entity.setPhone(req.getPhone().trim());
        entity.setStreet(req.getStreet().trim().toUpperCase());
    }

    private String currentUsernameOrSystem() {
        try {
            User user = userService.getCurrentUser();
            return user != null ? user.getEmail() : "system";
        } catch (Exception e) {
            return "system";
        }
    }

    private Provider mapToProvider(ProviderEntity providerEntity) {
        return Provider.builder()
                .id(providerEntity.getId())
                .name(providerEntity.getName())
                .email(providerEntity.getEmail())
                .phone(providerEntity.getPhone())
                .street(providerEntity.getStreet())
                .isActive(providerEntity.getIsActive())
                .createdBy(providerEntity.getCreatedBy())
                .updatedBy(providerEntity.getUpdatedBy())
                .deletedBy(providerEntity.getDeletedBy())
                .createdAt(providerEntity.getCreatedAt())
                .updatedAt(providerEntity.getUpdatedAt())
                .deletedAt(providerEntity.getDeletedAt())
                .build();
    }
}
