package org.example.back.services;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import org.example.back.dtos.CartDTO;
import org.springframework.stereotype.Service;

@Service
public interface CartService {
    CartDTO getCartByUser();
    CartDTO addItemToCart(Long productId);
    CartDTO updateCartItem(Long productId, Integer quantity);
    void removeItemFromCart(Long productId);
    void clearCart(String email);
    String initiatePayment() throws MPException, MPApiException;
}
