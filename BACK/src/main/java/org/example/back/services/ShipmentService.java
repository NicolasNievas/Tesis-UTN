package org.example.back.services;

import org.example.back.dtos.request.CreateShipmentRequest;
import org.example.back.dtos.request.UpdateShipmentStatusRequest;
import org.example.back.dtos.response.ShipmentResponse;
import org.springframework.stereotype.Service;

@Service
public interface ShipmentService {
    ShipmentResponse createShipment(CreateShipmentRequest request);
    ShipmentResponse updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request);
    ShipmentResponse getShipmentByTrackingCode(String trackingCode);
    ShipmentResponse getShipmentByOrderId(Long orderId);
}
