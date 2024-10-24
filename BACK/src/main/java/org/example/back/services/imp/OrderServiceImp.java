package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.response.OrderDetailResponse;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.entities.*;
import org.example.back.models.OrderDetailRequest;
import org.example.back.models.OrderRequest;
import org.example.back.models.User;
import org.example.back.repositories.*;
import org.example.back.services.CartService;
import org.example.back.services.OrderService;
import org.example.back.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImp implements OrderService {

    private final UserService userService;
    private final CartService cartService;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ShippingRepository shippingRepository;
    private final UserRepository userRepository;

    @Override
    public OrderResponse createOrder(OrderRequest orderRequest, String userEmail) {
        UserEntity userEntity = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userEmail));

        OrderEntity order = new OrderEntity();
        order.setCustomer(userEntity);
        order.setDate(LocalDateTime.now());
        order.setStatus(orderRequest.getStatus());

        PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(orderRequest.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));
        order.setPaymentMethod(paymentMethod);

        ShippingEntity shipping = shippingRepository.findById(orderRequest.getShippingId())
                .orElseThrow(() -> new RuntimeException("Método de envío no encontrado"));
        order.setShipping(shipping);

        Set<OrderDetailEntity> details = new HashSet<>();
        for (OrderDetailRequest detailRequest : orderRequest.getDetails()) {
            OrderDetailEntity detail = new OrderDetailEntity();
            ProductEntity product = productRepository.findById(detailRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            // Verificar y actualizar stock
            if (product.getStock() < detailRequest.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para " + product.getName());
            }
            product.setStock(product.getStock() - detailRequest.getQuantity());
            productRepository.save(product);

            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(detailRequest.getQuantity());
            detail.setPrice(detailRequest.getPrice());
            details.add(detail);
        }

        order.setDetails(details);
        OrderEntity savedOrder = orderRepository.save(order);

        // Limpiar el carrito después de crear la orden
        cartService.clearCart(userEmail);

        return convertToOrderResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getUserOrders() {
        User currentUser = userService.getCurrentUser();
        List<OrderEntity> orders = orderRepository.findByCustomerId(currentUser.getId());
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse convertToOrderResponse(OrderEntity order) {
        List<OrderDetailResponse> details = order.getDetails().stream()
                .map(detail -> OrderDetailResponse.builder()
                        .id(detail.getId())
                        .productName(detail.getProduct().getName())
                        .quantity(detail.getQuantity())
                        .price(detail.getPrice())
                        .subtotal(detail.getPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        BigDecimal total = details.stream()
                .map(OrderDetailResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return OrderResponse.builder()
                .id(order.getId())
                .date(order.getDate())
                .status(order.getStatus())
                .paymentMethodName(order.getPaymentMethod().getName())
                .shippingName(order.getShipping().getName())
                .total(total)
                .details(details)
                .build();
    }
}