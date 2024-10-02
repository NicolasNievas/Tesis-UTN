package org.example.back.controllers;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.AuthResponse;
import org.example.back.dtos.LoginRequest;
import org.example.back.dtos.RegisterRequest;
import org.example.back.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
       try{
           return ResponseEntity.ok(authService.login(request));
       } catch (Exception e){
           return ResponseEntity.badRequest().build();
       }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try{
            return ResponseEntity.ok(authService.register(request));
        } catch (Exception e){
            return ResponseEntity.badRequest().build();
        }
    }
}
