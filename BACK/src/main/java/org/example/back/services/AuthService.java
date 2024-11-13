package org.example.back.services;

import org.example.back.dtos.request.LoginRequest;
import org.example.back.dtos.request.RegisterRequest;
import org.example.back.dtos.request.ResetPasswordRequest;
import org.example.back.dtos.response.AuthResponse;
import org.example.back.dtos.response.PasswordResetResponse;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    PasswordResetResponse forgotPassword(String email);
    PasswordResetResponse resetPassword(ResetPasswordRequest request);
}
