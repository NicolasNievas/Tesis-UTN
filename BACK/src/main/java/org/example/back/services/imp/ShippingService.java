package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.ShippingDTO;
import org.example.back.entities.ShippingEntity;
import org.example.back.repositories.ShippingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingService implements org.example.back.services.ShippingService {

    private final ShippingRepository shippingRepository;

    @Override
    public List<ShippingDTO> getAllActiveShippingMethods() {
        return shippingRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

    }

    @Override
    public ShippingDTO getShippingById(Long id) {
        ShippingEntity entity = shippingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipping method not found"));
        return convertToDTO(entity);
    }

    @Override
    public BigDecimal calculateShippingCost(Long shippingId, String postalCode) {
        ShippingEntity shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new RuntimeException("Shipping method not found"));

        // Si es retiro local (LOCAL_PICKUP), el costo es 0
        if ("LOCAL_PICKUP".equals(shipping.getName())) {
            return BigDecimal.ZERO;
        }

        BigDecimal baseCost = shipping.getBaseCost();

        // Aquí puedes agregar lógica adicional para calcular costos
        // según código postal, distancia, etc.
        if (shipping.getRequiresPostalCode() && postalCode != null) {
            baseCost = calculateCostByPostalCode(shipping, postalCode);
        }

        return baseCost;
    }

    private BigDecimal calculateCostByPostalCode(ShippingEntity shipping, String postalCode) {
        // Lógica para calcular costo según código postal
        // Por ejemplo, si es CABA (códigos que empiezan con C o 1)
        if (postalCode.startsWith("C") || postalCode.startsWith("1")) {
            return shipping.getBaseCost();
        }

        // Para otras zonas, agregar un 30% al costo base
        return shipping.getBaseCost().multiply(new BigDecimal("1.30"));
    }

    private ShippingDTO convertToDTO(ShippingEntity entity) {
        return ShippingDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .displayName(entity.getDisplayName())
                .baseCost(entity.getBaseCost())
                .description(entity.getDescription())
                .estimatedDays(entity.getEstimatedDays())
                .requiresPostalCode(entity.getRequiresPostalCode())
                .build();
    }
}
