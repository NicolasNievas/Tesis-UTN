package org.example.back.configs;

import org.example.back.models.User;
import org.example.back.services.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorAware(UserService userService) {
        return () -> {
            try {
                User u = userService.getCurrentUser();
                if (u != null && u.getEmail() != null && !u.getEmail().isBlank()) {
                    return Optional.of(u.getEmail());
                }
            } catch (Exception ignored) {
            }
            return Optional.of("system");
        };
    }
}
