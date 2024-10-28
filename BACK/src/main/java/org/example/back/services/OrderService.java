package org.example.back.services;

import org.example.back.dtos.response.OrderResponse;
import org.example.back.models.OrderRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderService {
    OrderResponse createOrder (OrderRequest orderRequest, String userEmail);
    List<OrderResponse> getUserOrders();
    List<OrderResponse> getAllOrders();
}
