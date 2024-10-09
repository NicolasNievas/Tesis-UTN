package org.example.back.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.back.models.ContactForm;
import org.example.back.services.MailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/mail")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class MailController {

    private final MailService mailService;

    @PostMapping("/send-email")
    @Operation(summary = "Send an email to the administrator")
    @ApiResponse(responseCode = "200", description = "Email sent successfully")
    @ApiResponse(responseCode = "400", description = "Bad request")
    public ResponseEntity<Map<String, String>> sendMail(@RequestBody ContactForm contactForm){
        try {
            mailService.sendEmail(contactForm);
            return ResponseEntity.ok(
                    Collections.singletonMap("message", "Thank you for contacting us! Your message has been sent successfully.")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error procesando formulario de contacto", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "There was a problem sending your message. Please try again later."));
        }
    }
}
