package org.example.back.controllers;

import org.example.back.dtos.AuthResponse;
import org.example.back.dtos.UpdateUserRequest;
import org.example.back.models.User;
import org.example.back.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Obtener perfil de usuario", description = "Obtiene el perfil del usuario logueado.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    public ResponseEntity<User> getCurrentUserProfile(){
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update/profile")
    @Operation(summary = "Actualizar perfil de usuario", description = "Actualiza el perfil del usuario logueado.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    public ResponseEntity<User> updateUserProfile(@RequestBody UpdateUserRequest request){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.updateUserProfile(email, request);
        return ResponseEntity.ok(user);
    }
}
