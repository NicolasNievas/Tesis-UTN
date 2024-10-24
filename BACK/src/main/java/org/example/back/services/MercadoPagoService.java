package org.example.back.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import org.example.back.dtos.CartItemDTO;
import org.example.back.dtos.UserDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MercadoPagoService {
    String createPreference(List<CartItemDTO> items, UserDTO user) throws MPException, MPApiException;
    ResponseEntity<Void> webhookNotification(String dataId) throws JsonProcessingException;
}
