package org.example.back.services.imp;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.CartDTO;
import org.example.back.dtos.CartItemDTO;
import org.example.back.dtos.UserDTO;
import org.example.back.entities.CartEntity;
import org.example.back.entities.CartItemEntity;
import org.example.back.entities.ProductEntity;
import org.example.back.entities.UserEntity;
import org.example.back.models.User;
import org.example.back.repositories.CartRepository;
import org.example.back.repositories.ProductRepository;
import org.example.back.repositories.UserRepository;
import org.example.back.services.CartService;
import org.example.back.services.MercadoPagoService;
import org.example.back.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

        List<CartItemDTO> items = cart.getItems().stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());

        UserDTO userDTO = convertToUserDTO(currentUser);

        return mercadoPagoService.createPreference(items, userDTO);
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

        BigDecimal total = itemDTOs.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemDTOs)
                .total(total)
                .build();
    }

    private Integer getCurrentStock(Long productId) {
        return productRepository.findById(productId)
                .map(ProductEntity::getStock)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }
}
