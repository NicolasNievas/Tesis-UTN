package org.example.back.services;

import org.example.back.dtos.AuthResponse;
import org.example.back.dtos.LoginRequest;
import org.example.back.dtos.RegisterRequest;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
