package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.back.dtos.request.CreateShipmentRequest;
import org.example.back.dtos.request.UpdateShipmentStatusRequest;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.dtos.response.ShipmentResponse;
import org.example.back.dtos.response.ShipmentTrackingResponse;
import org.example.back.entities.OrderEntity;
import org.example.back.entities.ShipmentEntity;
import org.example.back.entities.ShipmentTrackingEntity;
import org.example.back.enums.OrderStatus;
import org.example.back.enums.ShipmentStatus;
import org.example.back.repositories.ShipmentRepository;
import org.example.back.repositories.OrderRepository;
import org.example.back.repositories.ShipmentTrackingRepository;
import org.example.back.services.MailService;
import org.example.back.services.OrderService;
import org.example.back.services.ShipmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ShipmentServiceImp implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository trackingRepository;
    private final OrderRepository orderRepository;
    private final MailService mailService;
    private final OrderService orderService;
    private static final SecureRandom random = new SecureRandom();

    @Override
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.PROCESSING) {
            throw new RuntimeException("Order must be PAID or PROCESSING before creating shipment");
        }

        if (shipmentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new RuntimeException("Shipment already exists for this order");
        }

        if (order.getShipping() == null) {
            throw new RuntimeException("Order has no shipping method");
        }

        // Generar codigo
        String trackingCode = generateTrackingCode(order.getShipping().getName());

        // Determinar fecha estimada
        LocalDateTime estimatedDelivery = calculateEstimatedDelivery(
                order.getShipping().getEstimatedDays()
        );

        // Determinar estado inicial según el método de envío
        ShipmentStatus initialStatus;
        if (order.getShipping().getName().equals("LOCAL_PICKUP")) {
            initialStatus = ShipmentStatus.READY_FOR_PICKUP;
            order.setStatus(OrderStatus.PROCESSING);
        } else {
            initialStatus = ShipmentStatus.PROCESSING;
            order.setStatus(OrderStatus.PROCESSING);
        }

        // Crear envío
        ShipmentEntity shipment = ShipmentEntity.builder()
                .order(order)
                .trackingCode(trackingCode)
                .carrier(order.getShipping().getName())
                .status(initialStatus)
                .estimatedDeliveryDate(estimatedDelivery)
                .recipientName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName())
                .recipientAddress(order.getShippingAddress())
                .recipientCity(order.getShippingCity())
                .recipientPostalCode(order.getShippingPostalCode())
                .recipientPhone(order.getCustomer().getPhoneNumber())
                .notes(request.getNotes())
                .build();

        shipment = shipmentRepository.save(shipment);

        // Crear primer registro de seguimiento
        createTrackingEntry(
                shipment,
                shipment.getStatus(),
                "Córdoba, AR",
                getInitialDescription(shipment.getCarrier())
        );

        orderRepository.save(order);

        log.info("Shipment created: trackingCode={}, orderId={}", trackingCode, order.getId());

        ShipmentResponse shipmentResponse = convertToResponse(shipment);

        if (!order.getShipping().getName().equals("LOCAL_PICKUP")) {
            try{
                OrderResponse orderResponse = orderService.getOrderById(order.getId());

                String userName = order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName();

                String userEmail = order.getCustomer().getEmail();

                mailService.sendTrackingEmail(userEmail, userName, orderResponse);

                log.info("Tracking email sent for order {} to {}", order.getId(), userEmail);
            } catch (Exception e){
                log.error("Failed to send tracking email for orderId={}", order.getId(), e);
            }
        }

        return shipmentResponse;
    }
    private String generateTrackingCode(String carrier) {
        String prefix;
        switch (carrier){
            case "OCA":
                prefix = "OCA";
                break;
            case "ANDREANI":
                prefix = "AND";
                break;
            case "CORREO_ARGENTINO":
                prefix = "CRA";
                break;
            case "LOCAL_PICKUP":
                prefix = "PKP";
                break;
            default:
                prefix = "SHP";
        }
        String datePart = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        String randomPart = String.format("%06d", random.nextInt(1000000));

        return String.format("%s-%s-%s", prefix, datePart, randomPart);
    }

    private LocalDateTime calculateEstimatedDelivery(Integer estimatedDays) {
        if (estimatedDays == null || estimatedDays == 0) {
            return LocalDateTime.now(); // Retiro local
        }
        return LocalDateTime.now().plusDays(estimatedDays);
    }

    private void createTrackingEntry(ShipmentEntity shipment, ShipmentStatus status,
                                     String location, String description) {
        ShipmentTrackingEntity tracking = ShipmentTrackingEntity.builder()
                .shipment(shipment)
                .status(status)
                .location(location)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        trackingRepository.save(tracking);
    }

    private String getInitialDescription(String carrier) {
        switch (carrier) {
            case "LOCAL_PICKUP":
                return "Your order is ready for pickup at our store. Monday to Friday, 9 AM to 6 PM.";
            case "OCA":
                return "Your package is being prepared for shipment via OCA.";
            case "ANDREANI":
                return "Your package is being prepared for shipment via Andreani.";
            case "CORREO_ARGENTINO":
                return "Your package is being prepared for shipment via Correo Argentino.";
            default:
                return "Your package is being prepared for shipment.";
        }
    }

    @Override
    public ShipmentResponse updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request) {
        ShipmentEntity shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        ShipmentStatus oldStatus = shipment.getStatus();
        ShipmentStatus newStatus = request.getStatus();

        // Validar transición de estado
        validateStatusTransition(oldStatus, newStatus);

        shipment.setStatus(newStatus);

        OrderEntity order = shipment.getOrder();

        // Actualizar fechas y estado de la orden según el estado del envío
        switch (newStatus) {
            case IN_TRANSIT:
                if (shipment.getShippedAt() == null) {
                    shipment.setShippedAt(LocalDateTime.now());
                }
                order.setStatus(OrderStatus.SHIPPED);
                break;

            case OUT_FOR_DELIVERY:
                order.setStatus(OrderStatus.SHIPPED);
                break;

            case DELIVERED:
                shipment.setDeliveredAt(LocalDateTime.now());
                order.setStatus(OrderStatus.DELIVERED);
                break;

            case CANCELLED:
                order.setStatus(OrderStatus.CANCELLED);
                break;

            case READY_FOR_PICKUP:
                order.setStatus(OrderStatus.PROCESSING);
                break;
        }

        shipment = shipmentRepository.save(shipment);
        orderRepository.save(order);

        // Crear entrada de seguimiento
        createTrackingEntry(
                shipment,
                newStatus,
                request.getLocation(),
                request.getDescription()
        );

        log.info("Shipment status updated: trackingCode={}, {} -> {}",
                shipment.getTrackingCode(), oldStatus, newStatus);

        if (shouldSendEmailForStatus(newStatus)) {
            try {
                OrderResponse orderResponse = orderService.getOrderById(shipment.getOrder().getId());

                String userName = shipment.getRecipientName();
                String userEmail = shipment.getOrder().getCustomer().getEmail();

                mailService.sendShipmentUpdateEmail(userEmail, userName, orderResponse, newStatus);

                log.info("Shipment update email sent for shipmentId={}, status={}, email={}",
                        shipmentId, newStatus, userEmail);

            } catch (Exception e) {
                log.error("Failed to send shipment update email for shipmentId={}", shipmentId, e);
            }
        }

        return convertToResponse(shipment);
    }

    private boolean shouldSendEmailForStatus(ShipmentStatus status) {
        return status == ShipmentStatus.IN_TRANSIT ||
                status == ShipmentStatus.OUT_FOR_DELIVERY ||
                status == ShipmentStatus.DELIVERED ||
                status == ShipmentStatus.READY_FOR_PICKUP;
    }

    private void validateStatusTransition(ShipmentStatus current, ShipmentStatus newStatus) {
        // No se puede cambiar desde DELIVERED, CANCELLED o RETURNED
        if (current == ShipmentStatus.DELIVERED ||
                current == ShipmentStatus.CANCELLED ||
                current == ShipmentStatus.RETURNED) {
            throw new RuntimeException("Cannot change status from " + current);
        }

        // No se puede retroceder a PENDING o PROCESSING desde estados avanzados
        if ((current == ShipmentStatus.IN_TRANSIT || current == ShipmentStatus.OUT_FOR_DELIVERY) &&
                (newStatus == ShipmentStatus.PENDING || newStatus == ShipmentStatus.PROCESSING)) {
            throw new RuntimeException("Invalid status transition from " + current + " to " + newStatus);
        }
    }

    @Override
    public ShipmentResponse getShipmentByTrackingCode(String trackingCode) {
        ShipmentEntity shipment = shipmentRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        return convertToResponse(shipment);
    }

    @Override
    public ShipmentResponse getShipmentByOrderId(Long orderId) {
        ShipmentEntity shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipment not found for this order"));

        return convertToResponse(shipment);
    }

    private ShipmentResponse convertToResponse(ShipmentEntity shipment) {
        List<ShipmentTrackingEntity> trackingHistory =
                trackingRepository.findByShipmentIdOrderByTimestampDesc(shipment.getId());

        List<ShipmentTrackingResponse> trackingResponses = trackingHistory.stream()
                .map(t -> ShipmentTrackingResponse.builder()
                        .id(t.getId())
                        .status(t.getStatus())
                        .timestamp(t.getTimestamp())
                        .location(t.getLocation())
                        .description(t.getDescription())
                        .build())
                .collect(Collectors.toList());

        return ShipmentResponse.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrder().getId())
                .trackingCode(shipment.getTrackingCode())
                .status(shipment.getStatus())
                .carrier(shipment.getCarrier())
                .createdAt(shipment.getCreatedAt())
                .shippedAt(shipment.getShippedAt())
                .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                .deliveredAt(shipment.getDeliveredAt())
                .recipientName(shipment.getRecipientName())
                .recipientAddress(shipment.getRecipientAddress())
                .recipientCity(shipment.getRecipientCity())
                .recipientPostalCode(shipment.getRecipientPostalCode())
                .recipientPhone(shipment.getRecipientPhone())
                .notes(shipment.getNotes())
                .trackingHistory(trackingResponses)
                .build();
    }
}
