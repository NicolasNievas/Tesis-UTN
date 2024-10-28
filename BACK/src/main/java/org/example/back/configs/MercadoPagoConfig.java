package org.example.back.configs;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:mercadopago.properties")
public class MercadoPagoConfig {

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @PostConstruct
    public void mercadoPagoInit() {
        com.mercadopago.MercadoPagoConfig.setAccessToken(accessToken);
    }

    public String getAccessToken() {
        return accessToken;
    }
}