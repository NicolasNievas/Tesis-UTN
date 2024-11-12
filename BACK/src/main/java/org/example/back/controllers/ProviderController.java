package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.example.back.models.Provider;
import org.example.back.services.ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/provider")
 @CrossOrigin(origins = "http://localhost:3000")
public class ProviderController {
    private final ProviderService providerService;

    @GetMapping("/all")
    @Operation(summary = "Get all providers", description = "Get all providers")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    public ResponseEntity<Iterable<Provider>> getAllProviders() {
        return ResponseEntity.ok(providerService.getAllProviders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get provider by id", description = "Get provider by id")
    @ApiResponse(responseCode = "200", description = "Successful operation")
    @ApiResponse(responseCode = "403", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Provider not found")
    public ResponseEntity<Provider> getProviderById(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.getProviderById(id));
    }
}
