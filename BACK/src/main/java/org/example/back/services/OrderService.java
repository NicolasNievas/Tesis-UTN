package org.example.back.services;

import org.example.back.dtos.UserOrderStatisticsDTO;
import org.example.back.dtos.response.PageResponse;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.enums.OrderStatus;
import org.example.back.models.OrderRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface OrderService {
    OrderResponse createOrder (OrderRequest orderRequest, String userEmail);
    List<OrderResponse> getUserOrders();
    List<OrderResponse> getAllOrders();
   PageResponse<OrderResponse> getAllOrders(OrderStatus status, LocalDateTime startDate,  LocalDateTime endDate, int page, int size);
   OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
   UserOrderStatisticsDTO getUserOrderStatistics();
   OrderResponse getOrderById(Long orderId);
}
