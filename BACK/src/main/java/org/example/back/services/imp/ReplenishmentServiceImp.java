package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.entities.MovementType;
import org.example.back.entities.ReplenishmentEntity;
import org.example.back.models.*;
import org.example.back.repositories.ReplenishmentRepository;
import org.example.back.services.ReplenishmentService;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReplenishmentServiceImp implements ReplenishmentService {
    private final ReplenishmentRepository replenishmentRepository;

    @Override
    public List<Replenishment> getAllReplenishments(MovementType movementType, Long productId,
                                                 LocalDateTime startDate, LocalDateTime endDate) {
        List<ReplenishmentEntity> replenishments;

        if (movementType == null && productId == null && startDate == null && endDate == null) {
            // Si no hay filtros, devolver todos
            replenishments = replenishmentRepository.findAll();
        } else {
            // Usar especificación para construir filtros dinámicamente
            Specification<ReplenishmentEntity> spec = Specification.where(null);

            if (movementType != null) {
                spec = spec.and((root, query, cb) ->
                        cb.equal(root.get("movementType"), movementType));
            }

            if (productId != null) {
                spec = spec.and((root, query, cb) ->
                        cb.equal(root.get("product").get("id"), productId));
            }

            if (startDate != null && endDate != null) {
                spec = spec.and((root, query, cb) ->
                        cb.between(root.get("date"), startDate, endDate));
            } else if (startDate != null) {
                spec = spec.and((root, query, cb) ->
                        cb.greaterThanOrEqualTo(root.get("date"), startDate));
            } else if (endDate != null) {
                spec = spec.and((root, query, cb) ->
                        cb.lessThanOrEqualTo(root.get("date"), endDate));
            }

            replenishments = replenishmentRepository.findAll(spec);
        }

        return replenishments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Replenishment getReplenishmentById(Long id) {
        ReplenishmentEntity replenishment = replenishmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Replenishment not found with id: " + id));
        return convertToDto(replenishment);
    }

    @Override
    public List<Replenishment> getReplenishmentsByMovementType(MovementType type) {
        return replenishmentRepository.findByMovementType(type)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private Replenishment convertToDto(ReplenishmentEntity entity) {
        return Replenishment.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .quantity(entity.getQuantity())
                .product(Product.builder()
                        .id(entity.getProduct().getId())
                        .name(entity.getProduct().getName())
                        .description(entity.getProduct().getDescription())
                        .price(entity.getProduct().getPrice())
                        .stock(entity.getProduct().getStock())
                        .imageUrls(entity.getProduct().getImageUrls())
                        .active(entity.getProduct().isActive())
                        .brandId(entity.getProduct().getBrand().getId())
                        .categoryId(entity.getProduct().getCategory().getId())
                        .build())
                .movementType(entity.getMovementType())
                .build();
    }

    /*
    .provider(Provider.builder()
                                .id(entity.getProduct().getProvider().getId())
                                .name(entity.getProduct().getProvider().getName())
                                .build())
     */
}
