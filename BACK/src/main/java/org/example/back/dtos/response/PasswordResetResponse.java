package org.example.back.dtos.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetResponse {
    private String message;
    private boolean success;
}
