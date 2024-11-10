package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.example.back.dtos.response.PurchaseOrderResponse;
import org.example.back.entities.*;
import org.example.back.enums.DeliveryStatus;

import org.example.back.dtos.response.InvoiceResponse;
import org.example.back.dtos.response.SimulatedDeliveryResponse;
import org.example.back.services.PurchaseOrderService;

import org.example.back.models.*;
import org.example.back.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImp implements PurchaseOrderService {

    private final ProductRepository productRepository;
    private final ProviderRepository providerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ReplenishmentRepository replenishmentRepository;
    private final Random random = new Random();

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrderNew(Long providerId, List<ProviderOrderDetail> orderDetails) {
        ProviderEntity provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        PurchaseOrderEntity order = new PurchaseOrderEntity(providerId, LocalDate.now(), OrderStatus.PENDING);
        order.setProvider(provider);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus(OrderStatus.PENDING);

        List<PurchaseOrderDetailEntity> details = new ArrayList<>();

        for (ProviderOrderDetail detail : orderDetails) {
            ProductEntity product = productRepository.findById(detail.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // Calcular y redondear `finalPrice` a dos decimales
            double unroundedPrice = detail.getPurchasePrice() * (1.0 + (random.nextDouble() * 0.1 - 0.05));
            double finalPrice = BigDecimal.valueOf(unroundedPrice).setScale(2, RoundingMode.HALF_UP).doubleValue();

            PurchaseOrderDetailEntity orderDetail = new PurchaseOrderDetailEntity();
            orderDetail.setProduct(product);
            orderDetail.setRequestedQuantity(detail.getRequestedQuantity());
            orderDetail.setRequestedPrice(detail.getPurchasePrice());
            orderDetail.setFinalPrice(finalPrice); // Usar el precio redondeado
            orderDetail.setPurchaseOrder(order);

            details.add(orderDetail);
        }

        order.setOrderDetails(details);
        PurchaseOrderEntity savedOrder = purchaseOrderRepository.save(order);

        DeliverySimulation simulation = simulateDelivery(details);
        order.setExpectedDeliveryDays(simulation.getDelayDays());

        for (DeliverySimulationDetail simDetail : simulation.getDetails()) {
            PurchaseOrderDetailEntity orderDetail = details.stream()
                    .filter(d -> d.getProduct().getId().equals(simDetail.getProductId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found in order"));

            orderDetail.setSimulatedReceivedQuantity(simDetail.getReceivedQuantity());
            orderDetail.setSimulatedStatus(simDetail.getStatus());
        }

        purchaseOrderRepository.save(order);

        return PurchaseOrderResponse.builder()
                .orderId(savedOrder.getId())
                .orderDate(savedOrder.getOrderDate())
                .status(savedOrder.getOrderStatus())
                .expectedDeliveryDays(simulation.getDelayDays())
                .simulatedDelivery(mapToSimulatedDeliveryDetails(details, simulation))
                .build();
    }

    @Override
    @Transactional
    public SimulatedDeliveryResponse simulateProviderResponse(Long orderId) {
        PurchaseOrderEntity order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        List<DeliverySimulationDetail> details = order.getOrderDetails().stream()
                .map(detail -> new DeliverySimulationDetail(
                        detail.getProduct().getId(),
                        detail.getSimulatedReceivedQuantity(),
                        detail.getSimulatedStatus(),
                        detail.getFinalPrice()
                ))
                .collect(Collectors.toList());

        return SimulatedDeliveryResponse.builder()
                .invoiceId(order.getId())
                .delayDays(order.getExpectedDeliveryDays())
                .details(details)
                .build();
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoiceFromDelivery(Long orderId, List<DeliveryConfirmationDetail> deliveryDetails) {
        PurchaseOrderEntity order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setProvider(order.getProvider());
        invoice.setDate(LocalDate.now());
        invoice.setOrderStatus(OrderStatus.COMPLETED);
        invoice.setPurchaseOrder(order);

        List<InvoiceDetailEntity> invoiceDetails = new ArrayList<>();
        double totalAmount = 0.0;

        for (DeliveryConfirmationDetail detail : deliveryDetails) {
            PurchaseOrderDetailEntity orderDetail = findOrderDetail(order.getOrderDetails(), detail.getProductId());

            // Usar `finalPrice` ya almacenado en `orderDetail`
            double finalPrice = orderDetail.getFinalPrice();

            InvoiceDetailEntity invoiceDetail = new InvoiceDetailEntity();
            invoiceDetail.setInvoice(invoice);
            invoiceDetail.setProduct(orderDetail.getProduct());
            invoiceDetail.setQuantity(detail.getReceivedQuantity());
            invoiceDetail.setPurchaseOrder(finalPrice);

            ProductEntity product = orderDetail.getProduct();
            product.setStock(product.getStock() + detail.getReceivedQuantity());
            productRepository.save(product);

            createReplenishmentRecord(product, detail.getReceivedQuantity());

            totalAmount += finalPrice * detail.getReceivedQuantity();
            invoiceDetails.add(invoiceDetail);
        }

        invoice.setTotalEntered(totalAmount);
        invoice.setInvoiceDetails(invoiceDetails);
        invoiceRepository.save(invoice);

        order.setOrderStatus(OrderStatus.COMPLETED);

        return mapToInvoiceResponse(invoice);
    }

    private List<SimulatedDeliveryDetail> mapToSimulatedDeliveryDetails(
            List<PurchaseOrderDetailEntity> orderDetails,
            DeliverySimulation simulation) {
        return simulation.getDetails().stream()
                .map(sim -> {
                    PurchaseOrderDetailEntity orderDetail = orderDetails.stream()
                            .filter(d -> d.getProduct().getId().equals(sim.getProductId()))
                            .findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found in order"));

                    return SimulatedDeliveryDetail.builder()
                            .productId(sim.getProductId())
                            .productName(orderDetail.getProduct().getName())
                            .status(sim.getStatus())
                            .requestedQuantity(orderDetail.getRequestedQuantity())
                            .expectedQuantity(sim.getReceivedQuantity())
                            .finalPrice(sim.getFinalPrice())
                            .statusMessage(generateStatusMessage(sim))
                            .build();
                })
                .collect(Collectors.toList());
    }
    private String generateStatusMessage(DeliverySimulationDetail sim) {
        switch (sim.getStatus()) {
            case COMPLETE:
                return "Entrega completa disponible";
            case PARTIAL:
                return String.format("Stock parcial disponible: %d unidades", sim.getReceivedQuantity());
            case NOT_AVAILABLE:
                return "Producto temporalmente sin stock";
            default:
                return "Estado desconocido";
        }
    }

    private PurchaseOrderDetailEntity findOrderDetail(List<PurchaseOrderDetailEntity> details, Long productId) {
        return details.stream()
                .filter(detail -> detail.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in order"));
    }

    private void createReplenishmentRecord(ProductEntity product, Integer quantity) {
        ReplenishmentEntity replenishment = new ReplenishmentEntity();
        replenishment.setProduct(product);
        replenishment.setQuantity(quantity);
        replenishment.setDate(LocalDateTime.now());
        replenishment.setMovementType(MovementType.INCOME);
        replenishmentRepository.save(replenishment);
    }

    private DeliverySimulation simulateDelivery(List<PurchaseOrderDetailEntity> orderDetails) {
        List<DeliverySimulationDetail> simulatedDetails = orderDetails.stream()
                .map(this::simulateDetailWithScenarios)
                .collect(Collectors.toList());

        int delayDays = random.nextDouble() < 0.3 ? random.nextInt(5) + 1 : 0;

        return new DeliverySimulation(simulatedDetails, delayDays);
    }

    private DeliverySimulationDetail simulateDetailWithScenarios(PurchaseOrderDetailEntity detail) {
        double scenario = random.nextDouble();

        int receivedQuantity = scenario < 0.1 ? 0 : scenario < 0.3 ? (int) (detail.getRequestedQuantity() * (0.5 + random.nextDouble() * 0.4)) : detail.getRequestedQuantity();
        DeliveryStatus status = scenario < 0.1 ? DeliveryStatus.NOT_AVAILABLE : scenario < 0.3 ? DeliveryStatus.PARTIAL : DeliveryStatus.COMPLETE;
        double finalPrice = detail.getFinalPrice(); // Usar el `finalPrice` previamente almacenado

        return new DeliverySimulationDetail(
                detail.getProduct().getId(),
                receivedQuantity,
                status,
                finalPrice
        );
    }

    private InvoiceResponse mapToInvoiceResponse(InvoiceEntity invoice) {
        return InvoiceResponse.builder()
                .invoiceId(invoice.getId())
                .deliveryDate(invoice.getDate())
                .totalAmount(invoice.getTotalEntered())
                .details(invoice.getInvoiceDetails().stream()
                        .map(detail -> DeliveryDetailResponse.builder()
                                .productId(detail.getProduct().getId())
                                .productName(detail.getProduct().getName())
                                .requestedQuantity(detail.getQuantity()) // Cantidad solicitada en la orden
                                .receivedQuantity(detail.getQuantity()) // Cantidad recibida (ajustada)
                                .finalPrice(detail.getPurchaseOrder()) // Precio unitario final (ajustado)
                                .variance(detail.getQuantity() - detail.getQuantity()) // Diferencia entre solicitado y recibido
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}