package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.UserOrderStatisticsDTO;
import org.example.back.dtos.response.PageResponse;
import org.example.back.dtos.response.OrderDetailResponse;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.entities.*;
import org.example.back.enums.MovementType;
import org.example.back.enums.OrderStatus;
import org.example.back.models.CustomerInfo;
import org.example.back.models.OrderDetailRequest;
import org.example.back.models.OrderRequest;
import org.example.back.models.User;
import org.example.back.repositories.*;
import org.example.back.services.CartService;
import org.example.back.services.OrderService;
import org.example.back.services.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final ReplenishmentRepository replenishmentRepository;
    private final CartRepository cartRepository;
    private final ShippingService shippingService;

    @Override
    public OrderResponse createOrder(OrderRequest orderRequest, String userEmail) {
        UserEntity userEntity = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userEmail));

        // Obtener el carrito del usuario
        CartEntity cart = cartRepository.findByUserId(userEntity.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        OrderEntity order = new OrderEntity();
        order.setCustomer(userEntity);
        order.setDate(LocalDateTime.now());
        order.setStatus(orderRequest.getStatus());
        order.setPaymentId(orderRequest.getPaymentId());
        order.setMercadoPagoOrderId(orderRequest.getMercadoPagoOrderId());
        order.setCustomerNroDoc(orderRequest.getCustomerNroDoc());
        order.setCustomerTypeDoc(orderRequest.getCustomerTypeDoc());

        PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(orderRequest.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));
        order.setPaymentMethod(paymentMethod);

        // Asignar método de envío desde el carrito
        if (cart.getSelectedShipping() != null) {
            order.setShipping(cart.getSelectedShipping());

            // Calcular y guardar el costo de envío
            BigDecimal shippingCost = shippingService.calculateShippingCost(
                    cart.getSelectedShipping().getId(),
                    cart.getShippingPostalCode()
            );
            order.setShippingCost(shippingCost);

            // Guardar dirección de envío
            order.setShippingAddress(cart.getShippingAddress());
            order.setShippingCity(cart.getShippingCity());
            order.setShippingPostalCode(cart.getShippingPostalCode());
        } else {
            // Si no hay método de envío seleccionado, usar uno por defecto (retiro local)
            ShippingEntity defaultShipping = shippingRepository.findByName("LOCAL_PICKUP")
                    .orElseThrow(() -> new RuntimeException("Método de envío por defecto no encontrado"));
            order.setShipping(defaultShipping);
            order.setShippingCost(BigDecimal.ZERO);
        }

        Set<OrderDetailEntity> details = new HashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO;
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

            // Registro de movimiento de stock
            ReplenishmentEntity replenishment = new ReplenishmentEntity();
            replenishment.setProduct(product);
            replenishment.setQuantity(detailRequest.getQuantity());
            replenishment.setDate(LocalDateTime.now());
            replenishment.setMovementType(MovementType.EXPENSE);
            replenishmentRepository.save(replenishment);

            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(detailRequest.getQuantity());
            detail.setPrice(detailRequest.getPrice());
            details.add(detail);

            subtotal = subtotal.add(detailRequest.getPrice()
                    .multiply(BigDecimal.valueOf(detailRequest.getQuantity())));
        }

        order.setSubtotal(subtotal);
        order.setDetails(details);
        OrderEntity savedOrder = orderRepository.save(order);

        // Limpiar el carrito después de crear la orden
        cartService.clearCart(userEmail);

        return convertToOrderResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getUserOrders() {
        User currentUser = userService.getCurrentUser();
        List<OrderEntity> orders = orderRepository.findByCustomerIdOrderByDateDesc(currentUser.getId());
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        List<OrderEntity> orders = orderRepository.findAllByOrderByDateDesc();
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }
    @Override
    public PageResponse<OrderResponse> getAllOrders(
            OrderStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        String statusStr = status != null ? status.name() : null;
        Page<OrderEntity> orderPage = orderRepository.findOrdersByFilters(statusStr,startDate, endDate, pageable);

        List<OrderResponse> orders = orderPage.getContent().stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(orders)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + orderId));
        validateStatusTransition(order.getStatus(), status);

        order.setStatus(status);
        OrderEntity updatedOrder = orderRepository.save(order);
        return convertToOrderResponse(updatedOrder);
    }

    @Override
    public UserOrderStatisticsDTO getUserOrderStatistics() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();

        Long totalOrders = orderRepository.countByCustomerId(userId);
        BigDecimal totalSpent = orderRepository.getTotalSpentByCustomer(userId);
        Long pendingOrders = orderRepository.countByCustomerIdAndStatus(userId, OrderStatus.PENDING);
        Long completedOrders = orderRepository.countByCustomerIdAndStatus(userId, OrderStatus.COMPLETED);
        Long inProcessOrders = orderRepository.countByCustomerIdAndStatus(userId, OrderStatus.IN_PROCESS);
        Long cancelledOrders = orderRepository.countByCustomerIdAndStatus(userId, OrderStatus.CANCELLED);

        return UserOrderStatisticsDTO.builder()
                .totalOrders(totalOrders)
                .totalSpent(totalSpent != null ? totalSpent : BigDecimal.ZERO)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .inProcessOrders(inProcessOrders)
                .cancelledOrders(cancelledOrders)
                .build();
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.COMPLETED &&
                (newStatus == OrderStatus.IN_PROCESS || newStatus == OrderStatus.PENDING)) {
            throw new RuntimeException("No se puede cambiar el estado de una orden completada a " + newStatus);
        }

        if (currentStatus == OrderStatus.CANCELLED && newStatus != OrderStatus.PENDING){
            throw new RuntimeException("No se puede cambiar el estado de una orden cancelada a " + newStatus);
        }
    }

    private OrderResponse convertToOrderResponse(OrderEntity order) {
        CustomerInfo customerInfo = null;
        if (order.getCustomer() != null) {
            customerInfo = CustomerInfo.builder()
                    .firstName(order.getCustomer().getFirstName())
                    .lastName(order.getCustomer().getLastName())
                    .email(order.getCustomer().getEmail())
                    .phoneNumber(order.getCustomer().getPhoneNumber())
                    .address(order.getCustomer().getAddress())
                    .city(order.getCustomer().getCity())
                    .nroDoc(order.getCustomerNroDoc())
                    .typeDoc(order.getCustomerTypeDoc())
                    .build();
        }

        List<OrderDetailResponse> details = order.getDetails().stream()
                .map(detail -> OrderDetailResponse.builder()
                        .id(detail.getId())
                        .productName(detail.getProduct().getName())
                        .quantity(detail.getQuantity())
                        .price(detail.getPrice())
                        .subtotal(detail.getPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                        .imageUrl(detail.getProduct().getImageUrls() != null && !detail.getProduct().getImageUrls().isEmpty()
                                ? detail.getProduct().getImageUrls().get(0)
                                : null)
                        .build())
                .collect(Collectors.toList());

        // Calcular subtotal de productos
        BigDecimal subtotal = order.getSubtotal() != null
                ? order.getSubtotal()
                : details.stream()
                .map(OrderDetailResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Obtener costo de envío
        BigDecimal shippingCost = order.getShippingCost() != null
                ? order.getShippingCost()
                : BigDecimal.ZERO;

        // Calcular total (subtotal + envío)
        BigDecimal total = subtotal.add(shippingCost);

        return OrderResponse.builder()
                .id(order.getId())
                .date(order.getDate())
                .status(order.getStatus())
                .paymentMethodName(order.getPaymentMethod().getName())
                .shippingName(order.getShipping().getName())
                .customer(customerInfo)
                .subtotal(subtotal)
                .shippingCost(shippingCost)
                .total(total)
                .details(details)
                .paymentId(order.getPaymentId())
                .mercadoPagoOrderId(order.getMercadoPagoOrderId())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingPostalCode(order.getShippingPostalCode())
                .customerNroDoc(order.getCustomerNroDoc())
                .customerTypeDoc(order.getCustomerTypeDoc())
                .build();
    }
}
