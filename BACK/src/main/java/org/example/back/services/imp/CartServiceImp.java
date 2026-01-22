package org.example.back.services.imp;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.*;
import org.example.back.dtos.request.UpdateShippingRequest;
import org.example.back.entities.*;
import org.example.back.models.User;
import org.example.back.repositories.*;
import org.example.back.services.CartService;
import org.example.back.services.MercadoPagoService;
import org.example.back.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImp implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final MercadoPagoService mercadoPagoService;
    private final ShippingService shippingService;
    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;
    @Override
    @Transactional
    public CartDTO getCartByUser() {
        User user = userService.getCurrentUser();
        CartEntity cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CartEntity newCart = new CartEntity();
                    UserEntity userEntity = userRepository.findById(user.getId())
                            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                    newCart.setUser(userEntity);
                    newCart.setCreatedAt(LocalDateTime.now());
                    return cartRepository.save(newCart);
                });

        return convertToDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO addItemToCart(Long productId) {
        User currentUser = userService.getCurrentUser();
        UserEntity userEntity = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Verificar stock disponible
        Integer currentStock = getCurrentStock(productId);
        if (currentStock < 1) {
            throw new RuntimeException("Stock insuficiente");
        }

        CartEntity cart = cartRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    CartEntity newCart = new CartEntity();
                    newCart.setUser(userEntity);
                    newCart.setCreatedAt(LocalDateTime.now());
                    return cartRepository.save(newCart);
                });

        Optional<CartItemEntity> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            throw new RuntimeException("Producto ya agregado al carrito");
        } else {
            CartItemEntity newItem = new CartItemEntity();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(1);
            cart.getItems().add(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO updateCartItem( Long productId, Integer quantity) {
        User currentUser = userService.getCurrentUser();
        CartEntity cart = cartRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        CartItemEntity item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en el carrito"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            // Verificar stock disponible
            Integer currentStock = getCurrentStock(productId);
            if (currentStock < quantity) {
                throw new RuntimeException("Stock insuficiente");
            }
            item.setQuantity(quantity);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Override
    @Transactional
    public void removeItemFromCart( Long productId) {
        User currentUser = userService.getCurrentUser();
        CartEntity cart = cartRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        CartEntity cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }
    @Override
    @Transactional
    public String initiatePayment() throws MPException, MPApiException {
        User currentUser = userService.getCurrentUser();
        CartEntity cart = cartRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getSelectedShipping() == null) {
            throw new RuntimeException("Debe seleccionar un método de envío");
        }

        List<CartItemDTO> items = cart.getItems().stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());

        UserDTO userDTO = convertToUserDTO(currentUser);

        // Calcular costo de envío
        BigDecimal shippingCost = shippingService.calculateShippingCost(
                cart.getSelectedShipping().getId(),
                cart.getShippingPostalCode()
        );

        ShippingDTO shippingDTO = ShippingDTO.builder()
                .id(cart.getSelectedShipping().getId())
                .name(cart.getSelectedShipping().getName())
                .displayName(cart.getSelectedShipping().getDisplayName())
                .baseCost(shippingCost)
                .build();

        return mercadoPagoService.createPreference(items, userDTO, shippingCost, shippingDTO.getName());
    }

    @Override
    @Transactional
    public CartDTO updateShippingInfo(UpdateShippingRequest request) {
        User currentUser = userService.getCurrentUser();
        CartEntity cart = cartRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        // Actualizar método de envío
        if (request.getShippingMethodId() != null) {
            ShippingEntity shipping = shippingRepository.findById(request.getShippingMethodId())
                    .orElseThrow(() -> new RuntimeException("Método de envío no encontrado"));
            cart.setSelectedShipping(shipping);
        }

        // Actualizar dirección de envío
        if (request.getAddress() != null) {
            cart.setShippingAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            cart.setShippingCity(request.getCity());
        }
        if (request.getPostalCode() != null) {
            cart.setShippingPostalCode(request.getPostalCode());
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Override
    @Transactional
    public CheckoutDTO getCheckoutInfo() {
        User currentUser = userService.getCurrentUser();
        UserEntity userEntity = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        CartEntity cart = cartRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        // Si el carrito no tiene dirección, usar la del usuario
        if (cart.getShippingAddress() == null) {
            cart.setShippingAddress(userEntity.getAddress());
            cart.setShippingCity(userEntity.getCity());
            // Aquí podrías agregar lógica para el código postal si lo tienes en UserEntity
        }

        CartDTO cartDTO = convertToDTO(cart);
        List<ShippingDTO> shippingMethods = shippingService.getAllActiveShippingMethods();
        if (shippingMethods == null) {
            shippingMethods = new ArrayList<>(); // Lista vacía en lugar de null
        }

        BigDecimal subtotal = cartDTO.getSubtotal();
        BigDecimal shippingCost = BigDecimal.ZERO;

        if (cart.getSelectedShipping() != null) {
            shippingCost = shippingService.calculateShippingCost(
                    cart.getSelectedShipping().getId(),
                    cart.getShippingPostalCode()
            );
        }

        BigDecimal total = subtotal.add(shippingCost);

        ShippingAddressDTO addressDTO = ShippingAddressDTO.builder()
                .address(cart.getShippingAddress())
                .city(cart.getShippingCity())
                .postalCode(cart.getShippingPostalCode())
                .build();

        return CheckoutDTO.builder()
                .cart(cartDTO)
                .availableShippingMethods(shippingMethods)
                .subtotal(subtotal)
                .shippingCost(shippingCost)
                .total(total)
                .shippingAddress(addressDTO)
                .build();
    }

    @Override
    @Transactional
    public CartDTO reorderFromOrder(Long orderId) {
        User currentUser = userService.getCurrentUser();

        // Busca la orden
        OrderEntity order = orderRepository.findByIdAndUserId(orderId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        // Limpiar el carrito actual
        CartEntity cart = cartRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    CartEntity newCart = new CartEntity();
                    UserEntity userEntity = userRepository.findById(currentUser.getId())
                            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                    newCart.setUser(userEntity);
                    newCart.setCreatedAt(LocalDateTime.now());
                    return cartRepository.save(newCart);
                });

        // Limpiar items actuales del carrito
        cart.getItems().clear();

        // Agregar items de la orden anterior
        for (OrderDetailEntity detail : order.getDetails()) {
            // Verificar stock
            Integer currentStock = getCurrentStock(detail.getProduct().getId());
            if (currentStock < detail.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para " + detail.getProduct().getName() +
                        ". Disponible: " + currentStock + ", Solicitado: " + detail.getQuantity());
            }

            CartItemEntity newItem = new CartItemEntity();
            newItem.setCart(cart);
            newItem.setProduct(detail.getProduct());
            newItem.setQuantity(detail.getQuantity());
            cart.getItems().add(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        return convertToDTO(cart);
    }

    private CartEntity createNewCart(User user) {
        UserEntity userEntity = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        CartEntity newCart = new CartEntity();
        newCart.setUser(userEntity);
        newCart.setCreatedAt(LocalDateTime.now());

        // Inicializar dirección con la del usuario
        newCart.setShippingAddress(userEntity.getAddress());
        newCart.setShippingCity(userEntity.getCity());

        return cartRepository.save(newCart);
    }

    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .build();
    }

    private CartItemDTO convertToCartItemDTO(CartItemEntity item) {
        return CartItemDTO.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .price(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .imageUrls(item.getProduct().getImageUrls())
                .build();
    }
    private CartDTO convertToDTO(CartEntity cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> {
                    String firstImageUrl = item.getProduct().getImageUrls().isEmpty() ?
                            null : item.getProduct().getImageUrls().get(0);
                    Integer currentStock = getCurrentStock(item.getProduct().getId());
                    return CartItemDTO.builder()
                            .id(item.getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .imageUrls(Collections.singletonList(firstImageUrl))
                            .price(item.getProduct().getPrice())
                            .quantity(item.getQuantity())
                            .subtotal(item.getProduct().getPrice()
                                    .multiply(BigDecimal.valueOf(item.getQuantity())))
                            .availableStock(currentStock)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal subtotal = itemDTOs.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingCost = BigDecimal.ZERO;
        ShippingDTO shippingDTO = null;

        if (cart.getSelectedShipping() != null) {
            shippingCost = shippingService.calculateShippingCost(
                    cart.getSelectedShipping().getId(),
                    cart.getShippingPostalCode()
            );

            shippingDTO = ShippingDTO.builder()
                    .id(cart.getSelectedShipping().getId())
                    .name(cart.getSelectedShipping().getName())
                    .displayName(cart.getSelectedShipping().getDisplayName())
                    .baseCost(cart.getSelectedShipping().getBaseCost())
                    .description(cart.getSelectedShipping().getDescription())
                    .estimatedDays(cart.getSelectedShipping().getEstimatedDays())
                    .build();
        }

        BigDecimal total = subtotal.add(shippingCost);

        ShippingAddressDTO addressDTO = null;
        if (cart.getShippingAddress() != null) {
            addressDTO = ShippingAddressDTO.builder()
                    .address(cart.getShippingAddress())
                    .city(cart.getShippingCity())
                    .postalCode(cart.getShippingPostalCode())
                    .build();
        }

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemDTOs)
                .subtotal(subtotal)
                .shippingCost(shippingCost)
                .total(total)
                .selectedShippingId(cart.getSelectedShipping() != null
                        ? cart.getSelectedShipping().getId()
                        : null)
                .selectedShipping(shippingDTO)
                .shippingAddress(addressDTO)
                .build();
    }

    private Integer getCurrentStock(Long productId) {
        return productRepository.findById(productId)
                .map(ProductEntity::getStock)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }
}
