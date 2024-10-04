package org.example.back.controllers;

import org.example.back.models.User;
import org.example.back.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Obtener perfil de usuario", description = "Obtiene el perfil del usuario logueado.")
    @ApiResponse(responseCode = "200", description = "Operación exitosa")
    @ApiResponse(responseCode = "401", description = "No autorizado")
    public ResponseEntity<User> getCurrentUserProfile(){
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }
    
}
