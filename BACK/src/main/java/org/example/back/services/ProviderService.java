package org.example.back.services;

import org.example.back.dtos.request.ProviderRequest;
import org.example.back.models.Provider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProviderService {
    List<Provider> getAllProviders();
    Provider getProviderById(Long id);
    Provider createProvider(ProviderRequest req);
    Provider updateProvider(Long id, ProviderRequest req);
    Provider deleteProvider(Long id);
    Provider reactivateProvider(Long id);
}
