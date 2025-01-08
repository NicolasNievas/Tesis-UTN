package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.persistence.Enumerated;
import lombok.RequiredArgsConstructor;
import org.example.back.dtos.request.ForgotPasswordRequest;
import org.example.back.dtos.request.LoginRequest;
import org.example.back.dtos.request.RegisterRequest;
import org.example.back.dtos.request.ResetPasswordRequest;
import org.example.back.dtos.response.AuthResponse;
import org.example.back.dtos.response.PasswordResetResponse;
import org.example.back.enums.TypeDoc;
import org.example.back.models.Category;
import org.example.back.services.AuthService;
import org.example.back.services.MailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "https://optimistic-nourishment-production.up.railway.app")
public class AuthController {

    private final AuthService authService;
    private final MailService mailService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Inicia sesión en la aplicación.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
       try{
           return new ResponseEntity<>(authService.login(request), HttpStatus.OK);
       } catch (IllegalArgumentException e){
           throw new IllegalArgumentException(e.getMessage());
       }
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar un usuario", description = "Registra un nuevo usuario.")
    @ApiResponse(responseCode = "201", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try{
            return ResponseEntity.ok(authService.register(request));
        } catch (IllegalArgumentException e){
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verificar email", description = "Verifica el email de un usuario.")
    @ApiResponse(responseCode = "200", description = "Email verificado exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Codigo invalido o expirado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<Map<String, String>> verifyEmail(
            @RequestParam String email,
            @RequestParam String code) {
        try {
            mailService.verifyEmail(email, code);
            return ResponseEntity.ok(Collections.singletonMap("message", "Email verified successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Olvidé mi contraseña", description = "Envía un email con un código de verificación para restablecer la contraseña.")
    @ApiResponse(responseCode = "200", description = "Código enviado exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Email no encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<PasswordResetResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            PasswordResetResponse response = authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(PasswordResetResponse.builder()
                            .message(e.getMessage())
                            .success(false)
                            .build());
        }
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Restablece la contraseña de un usuario.")
    @ApiResponse(responseCode = "200", description = "Contraseña actualizada exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    @ApiResponse(responseCode = "400", description = "Código inválido o expirado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    public ResponseEntity<PasswordResetResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            PasswordResetResponse response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(PasswordResetResponse.builder()
                            .message(e.getMessage())
                            .success(false)
                            .build());
        }
    }

}
