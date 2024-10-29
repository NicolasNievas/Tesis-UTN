package org.example.back.services.imp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import lombok.extern.slf4j.Slf4j;
import org.example.back.dtos.CartItemDTO;
import org.example.back.dtos.UserDTO;
import org.example.back.entities.CartEntity;
import org.example.back.entities.OrderStatus;
import org.example.back.entities.PaymentMethodEntity;
import org.example.back.entities.UserEntity;
import org.example.back.models.OrderDetailRequest;
import org.example.back.models.OrderRequest;
import org.example.back.repositories.CartRepository;
import org.example.back.repositories.PaymentMethodRepository;
import org.example.back.repositories.UserRepository;
import org.example.back.services.MercadoPagoService;
import org.example.back.services.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.PropertySource;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@PropertySource("classpath:mercadopago.properties")
@Slf4j
public class MercadoPagoServiceImp implements MercadoPagoService {

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @Value("${mercadopago.success.url}")
    private String successUrl;

    @Value("${mercadopago.failure.url}")
    private String failureUrl;

    @Value("${mercadopago.pending.url}")
    private String pendingUrl;

    @Value("${mercadopago.notification.url}")
    private String notificationUrl;

    @Value("${mercadopago.statement.descriptor}")
    private String statementDescriptor;

    private final OrderService orderService;
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    public MercadoPagoServiceImp(@Lazy org.example.back.configs.MercadoPagoConfig mercadoPagoConfig, @Lazy OrderService orderService, RestTemplate restTemplate, UserRepository userRepository, CartRepository cartRepository, PaymentMethodRepository paymentMethodRepository) {
        this.orderService = orderService;
        this.restTemplate = restTemplate;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        MercadoPagoConfig.setAccessToken(mercadoPagoConfig.getAccessToken());
    }

    @Override
    public String createPreference(List<CartItemDTO> items, UserDTO user) throws MPException, MPApiException {
        PreferenceClient client = new PreferenceClient();

        if (user == null || user.getEmail() == null) {
            throw new IllegalArgumentException("User and email are required");
        }

        String orderId = "ORDER|||" + user.getEmail() + "|||" + System.currentTimeMillis();

        // Crear lista de ítems de la preferencia con descripción e imágenes
        List<PreferenceItemRequest> preferenceItems = items.stream()
                .map(this::convertToPreferenceItem)
                .collect(Collectors.toList());

        // Crear datos del comprador
        PreferencePayerRequest payer = PreferencePayerRequest.builder()
                .name(user.getFirstName())
                .surname(user.getLastName())
                .email(user.getEmail())
                .build();

        // Crear URLs de redirección
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(successUrl)
                .failure(failureUrl)
                .pending(pendingUrl)
                .build();

        // Métodos de pago excluidos
        PreferencePaymentMethodsRequest paymentMethods = PreferencePaymentMethodsRequest.builder()
                .excludedPaymentMethods(getExcludedPaymentMethods())
                .excludedPaymentTypes(getExcludedPaymentTypes())
                .build();

        // Crear preferencia con todos los datos
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(preferenceItems)
                .payer(payer)
                .backUrls(backUrls)
                .autoReturn("approved")
                .paymentMethods(paymentMethods)
                .notificationUrl(notificationUrl)
                .statementDescriptor(statementDescriptor)
                .externalReference(orderId)
                .expires(true)  // Activar expiración
                .expirationDateFrom(OffsetDateTime.now())  // Fecha de inicio
                .expirationDateTo(OffsetDateTime.now().plusDays(2))  // Expiración en 2 días
                .build();

        Preference preference = client.create(preferenceRequest);
        log.info("Preference created with ID: {} and external reference: {}",
                preference.getId(), orderId);
        System.out.println("Preference created: " + preference.getId());
        return preference.getId();
    }

    @Override
    public ResponseEntity<Void> webhookNotification(String dataId) throws JsonProcessingException {
        log.info("Processing webhook notification for payment ID: {}", dataId);

        try {
            String apiUrl = "https://api.mercadopago.com/v1/payments/" + dataId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode paymentData = mapper.readTree(response.getBody());

                String status = paymentData.path("status").asText();
                String externalReference = paymentData.path("external_reference").asText();
                String mercadoPagoOrderId = paymentData.path("order").path("id").asText();

                String paymentMethodId = paymentData.path("payment_method_id").asText();
                String paymentTypeId = paymentData.path("payment_type_id").asText();
                double transactionAmount = paymentData.path("transaction_amount").asDouble();

                // Obtener el email
                String userEmail = extractEmailFromReference(externalReference);
                if (userEmail == null) {
                    userEmail = paymentData.path("payer").path("email").asText();
                }

                if (userEmail == null || userEmail.trim().isEmpty()) {
                    log.error("Could not find valid user email in payment data");
                    return ResponseEntity.badRequest().build();
                }

                log.info("Processing payment - Status: {}, Reference: {}, Email: {}, Payment Method: {} - {}",
                        status, externalReference, userEmail, paymentMethodId, paymentTypeId);

                if (!status.equals("rejected")) {
                    Optional<UserEntity> userOptional = userRepository.findByEmail(userEmail);

                    if (userOptional.isEmpty()) {
                        log.error("User not found with email: {}", userEmail);
                        return ResponseEntity.badRequest().build();
                    }

                    UserEntity userEntity = userOptional.get();

                    Optional<CartEntity> cartOptional = cartRepository.findByUserId(userEntity.getId());
                    if (cartOptional.isEmpty()) {
                        log.error("Cart not found for user: {}", userEmail);
                        return ResponseEntity.badRequest().build();
                    }

                    CartEntity cart = cartOptional.get();

                    // Determinar el PaymentMethodEntity basado en el tipo de pago
                    Optional<PaymentMethodEntity> paymentMethodEntity = paymentMethodRepository.findByName(getPaymentMethodName(paymentTypeId));
                    if (paymentMethodEntity.isEmpty()) {
                        log.error("Payment method not found for type: {}", paymentTypeId);
                        return ResponseEntity.badRequest().build();
                    }

                    OrderRequest orderRequest = new OrderRequest();
                    orderRequest.setPaymentId(dataId);
                    orderRequest.setPaymentMethodId(paymentMethodEntity.get().getId());
                    orderRequest.setShippingId(1L); // ID por defecto del método de envío
                    orderRequest.setTransactionAmount(transactionAmount);
                    orderRequest.setPaymentMethodDetail(paymentMethodId + " - " + paymentTypeId);
                    orderRequest.setPaymentId(dataId);
                    orderRequest.setMercadoPagoOrderId(mercadoPagoOrderId);

                    // Mapear estado
                    switch (status) {
                        case "approved":
                            orderRequest.setStatus(OrderStatus.COMPLETED);
                            break;
                        case "pending":
                            orderRequest.setStatus(OrderStatus.PENDING);
                            break;
                        case "in_process":
                            orderRequest.setStatus(OrderStatus.IN_PROCESS);
                            break;
                        case "cancelled":
                            orderRequest.setStatus(OrderStatus.CANCELLED);
                            break;
                        case "rejected":
                            orderRequest.setStatus(OrderStatus.CANCELLED);
                            break;
                        default:
                            orderRequest.setStatus(OrderStatus.PENDING);
                    }

                    // Convertir items del carrito a detalles de orden
                    List<OrderDetailRequest> details = cart.getItems().stream()
                            .map(item -> OrderDetailRequest.builder()
                                    .productId(item.getProduct().getId())
                                    .quantity(item.getQuantity())
                                    .price(item.getProduct().getPrice())
                                    .build())
                            .collect(Collectors.toList());

                    orderRequest.setDetails(details);
                    orderService.createOrder(orderRequest, userEmail);

                    log.info("Order created successfully for payment ID: {}", dataId);
                }
                return ResponseEntity.ok().build();
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Error processing webhook notification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //Obtener email
    private String extractEmailFromReference(String externalReference) {
        if (externalReference == null) {
            throw new IllegalArgumentException("External reference cannot be null");
        }

        // Si el external_reference usa el nuevo formato (con |||)
        if (externalReference.contains("|||")) {
            String[] parts = externalReference.split("\\|\\|\\|");
            if (parts.length >= 2) {
                return parts[1];
            }
        }

        // Si tenemos el email directo en el formato email_timestamp
        if (externalReference.contains("@")) {
            String[] parts = externalReference.split("_");
            if (parts.length > 0 && parts[0].contains("@")) {
                return parts[0];
            }
        }

        return null;
    }

    //Obtener metodo de pago
    private String getPaymentMethodName(String paymentTypeId) {
        switch (paymentTypeId.toLowerCase()) {
            case "credit_card":
                return "CREDIT_CARD";
            case "debit_card":
                return "DEBIT_CARD";
            case "account_money":
                return "ACCOUNT_MONEY";
            default:
                return "OTHER";
        }
    }

    // Conversión de CartItemDTO a PreferenceItemRequest
    private PreferenceItemRequest convertToPreferenceItem(CartItemDTO item) {
        return PreferenceItemRequest.builder()
                .id(item.getProductId().toString())
                .title(item.getProductName())
                .description("Product Description")
                .pictureUrl(item.getImageUrls().isEmpty() ? "" : item.getImageUrls().get(0))  // Imagen del producto
                .categoryId("others")  // Categoría del producto
                .quantity(item.getQuantity())
                .currencyId("ARS")  // Moneda ARS
                .unitPrice(item.getPrice())
                .build();
    }

    // Métodos de pago excluidos
    private List<PreferencePaymentMethodRequest> getExcludedPaymentMethods() {
        List<PreferencePaymentMethodRequest> excludedPaymentMethods = new ArrayList<>();
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("amex").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("argencard").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("cabal").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("cmr").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("cencosud").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("diners").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("tarshop").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("debcabal").build());
        excludedPaymentMethods.add(PreferencePaymentMethodRequest.builder().id("maestro").build());
        return excludedPaymentMethods;
    }

    // Tipos de pago excluidos (por ejemplo, ticket)
    private List<PreferencePaymentTypeRequest> getExcludedPaymentTypes() {
        List<PreferencePaymentTypeRequest> excludedPaymentTypes = new ArrayList<>();
        excludedPaymentTypes.add(PreferencePaymentTypeRequest.builder().id("ticket").build());
        return excludedPaymentTypes;
    }
}