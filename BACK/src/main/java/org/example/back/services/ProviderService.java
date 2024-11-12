package org.example.back.services;

import org.example.back.models.Provider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProviderService {
    List<Provider> getAllProviders();
    Provider getProviderById(Long id);
}
