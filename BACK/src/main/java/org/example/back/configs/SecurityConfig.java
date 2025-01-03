package org.example.back.configs;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

import org.example.back.jwt.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final AuthenticationProvider authProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.ignoringRequestMatchers("/webhook").disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; " +
                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.mercadopago.com https://*.mercadolibre.com https://*.googleapis.com https://*.google.com https://*.gstatic.com https://*.googletagmanager.com https://sdk.mercadopago.com https://www.recaptcha.net https://www.gstatic.com; " +
                                        "style-src 'self' 'unsafe-inline' https://*.mercadopago.com https://*.mercadolibre.com https://*.googleapis.com; " +
                                        "font-src 'self' https://*.mlstatic.com data:; " +
                                        "img-src 'self' data: https://*.mlstatic.com https://*.mercadopago.com https://*.mercadolibre.com; " +
                                                "connect-src 'self' https://.mercadopago.com https://.mercadolibre.com https://*.mlstatic.com" +
                                        "frame-src 'self' https://*.mercadopago.com https://*.mercadolibre.com https://www.google.com;"))
                        .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .frameOptions(frame -> frame.sameOrigin())
                        .permissionsPolicy(permissions -> permissions
                                .policy("camera=(), microphone=(), geolocation=(), storage-access=()")))
                .authorizeHttpRequests(authRequest ->
                        authRequest
                                .requestMatchers("/auth/**","/api/schema/**", "/swagger-ui.html", "/swagger-ui/**",  "/v3/api-docs/**", "/products/**", "/brands/**", "/mail/**").permitAll()
                                .requestMatchers("/admin/**").hasRole("ADMINISTRATOR")
                                .requestMatchers("/replenishment/**" , "/provider/**"  , "/purchase-orders/**").hasRole("ADMINISTRATOR")
                                .requestMatchers("/cart/**").authenticated()
                                .requestMatchers("/webhook").permitAll()
                                .requestMatchers("/webhook/swagger-config").permitAll()
                                .requestMatchers("/orders/**").authenticated()
                                .anyRequest().authenticated()
                )
                .sessionManagement(sessionManager ->
                        sessionManager
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}