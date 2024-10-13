package org.example.back.services;

import org.example.back.dtos.*;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    PasswordResetResponse forgotPassword(String email);
    PasswordResetResponse resetPassword(ResetPasswordRequest request);
}
