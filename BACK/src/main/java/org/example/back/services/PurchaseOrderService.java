package org.example.back.services;

import org.example.back.dtos.response.InvoiceResponse;
import org.example.back.dtos.response.PurchaseOrderResponse;
import org.example.back.dtos.response.SimulatedDeliveryResponse;
import org.example.back.models.DeliveryConfirmationDetail;
import org.example.back.models.ProviderOrderDetail;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PurchaseOrderService {
    PurchaseOrderResponse createPurchaseOrderNew(Long providerId, List<ProviderOrderDetail> orderDetails);
    SimulatedDeliveryResponse simulateProviderResponse(Long orderId);
    InvoiceResponse createInvoiceFromDelivery(Long orderId, List<DeliveryConfirmationDetail> deliveryDetails);
}
