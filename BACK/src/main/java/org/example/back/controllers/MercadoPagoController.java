package org.example.back.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.back.services.CartService;
import org.example.back.services.MercadoPagoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class MercadoPagoController {

    private final MercadoPagoService mercadoPagoService;
    private final CartService cartService;

    @PostMapping("/mercadopago/initiate-payment")
    @Operation(summary = "Initiate payment process", description = "Initiates the payment process with Mercado Pago")
    @ApiResponse(responseCode = "200", description = "Payment process initiated successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<Map<String, String>> initiatePayment() {
        try {
            String preferenceId = cartService.initiatePayment();
            return ResponseEntity.ok(Collections.singletonMap("preferenceId", preferenceId));
        } catch (MPException | MPApiException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error initiating payment: " + e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    @Operation(summary = "Webhook notification", description = "Receives and processes webhook notifications from Mercado Pago")
    @ApiResponse(responseCode = "200", description = "Webhook notification processed successfully")
    @ApiResponse(responseCode = "400", description = "Bad request")
    public ResponseEntity<Void> webhookNotification(@RequestBody String payload) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode data = mapper.readTree(payload);

        // Mercado Pago puede enviar diferentes tipos de notificaciones
        if (data.has("data") && data.get("data").has("id")) {
            String dataId = data.get("data").get("id").asText();
            log.info("Received webhook notification with dataId: {}", dataId);
            return mercadoPagoService.webhookNotification(dataId);
        }

        return ResponseEntity.badRequest().build();
    }
}
