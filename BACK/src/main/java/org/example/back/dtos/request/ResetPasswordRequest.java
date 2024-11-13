package org.example.back.dtos.request;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {
    private String email;
    private String code;
    private String newPassword;
}