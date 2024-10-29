package org.example.back.services;

import org.example.back.dtos.PageResponse;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.entities.OrderStatus;
import org.example.back.models.OrderRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface OrderService {
    OrderResponse createOrder (OrderRequest orderRequest, String userEmail);
    List<OrderResponse> getUserOrders();
    List<OrderResponse> getAllOrders();
   // PageResponse<OrderResponse> getAllOrders(LocalDateTime startDate, LocalDateTime endDate, OrderStatus status, int page, int size);
}
