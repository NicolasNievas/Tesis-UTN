package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.example.back.dtos.request.ProviderRequest;
import org.example.back.models.Provider;
import org.example.back.services.ProviderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/provider")
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
    public ResponseEntity<?> getProviderById(@PathVariable Long id) {
        try{
            return ResponseEntity.ok(providerService.getProviderById(id));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create")
    @Operation(summary = "Create a new provider", description = "Create a new provider")
    @ApiResponse(responseCode = "201", description = "Provider created successfully")
    @ApiResponse(responseCode = "400", description = "Bad request")
    public ResponseEntity<?> createProvider(@RequestBody ProviderRequest provider) {
        try {
            Provider createdProvider = providerService.createProvider(provider);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProvider);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Update an existing provider", description = "Update an existing provider")
    @ApiResponse(responseCode = "200", description = "Provider updated successfully")
    @ApiResponse(responseCode = "400", description = "Bad request")
    @ApiResponse(responseCode = "404", description = "Provider not found")
    public ResponseEntity<?> updateProvider(@PathVariable Long id, @RequestBody ProviderRequest provider) {
        try{
            Provider updatedProvider = providerService.updateProvider(id, provider);
            return ResponseEntity.ok(updatedProvider);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (ResourceNotFoundException e ) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/delete/{id}")
    @Operation(summary = "Delete a provider", description = "Delete a provider")
    @ApiResponse(responseCode = "200", description = "Provider deleted successfully")
    @ApiResponse(responseCode = "404", description = "Provider not found")
    public ResponseEntity<?> deleteProvider(@PathVariable Long id) {
        try {
            Provider deletedProvider = providerService.deleteProvider(id);
            return ResponseEntity.ok(deletedProvider);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/reactivate/{id}")
    @Operation(summary = "Reactivate a provider", description = "Reactivate a provider")
    @ApiResponse(responseCode = "200", description = "Provider reactivated successfully")
    @ApiResponse(responseCode = "404", description = "Provider not found")
    public ResponseEntity<?> reactivateProvider(@PathVariable Long id) {
        try {
            Provider reactivatedProvider = providerService.reactivateProvider(id);
            return ResponseEntity.ok(reactivatedProvider);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
