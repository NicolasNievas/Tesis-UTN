package org.example.back.configs;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    private static final int TIME_OUT = 10000; // expressed in milliseconds 10000 = 10 sec.

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(TIME_OUT))
                .setReadTimeout(Duration.ofMillis(TIME_OUT))
                .build();
    }
}
