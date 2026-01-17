package org.example.back.services;

import org.example.back.dtos.ShippingDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface ShippingService {
    List<ShippingDTO> getAllActiveShippingMethods();
    ShippingDTO getShippingById(Long id);
    BigDecimal calculateShippingCost(Long shippingId, String postalCode);
}
