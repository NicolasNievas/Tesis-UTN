package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.*;
import org.example.back.entities.Role;
import org.example.back.entities.UserEntity;
import org.example.back.jwt.JwtService;
import org.example.back.repositories.UserRepository;
import org.example.back.services.AuthService;
import org.example.back.services.MailService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImp implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;
    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Email not verified. Please verify your email first.");
        }
        String token = jwtService.getToken(user);
        return AuthResponse.builder()
                .token(token)
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {

        Optional<UserEntity> existingUserEmail = userRepository.findByEmail(request.getEmail());
        if (existingUserEmail.isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        Optional<UserEntity> existingUserPhoneNumber = userRepository.findByPhoneNumber(request.getPhoneNumber());
        if (existingUserPhoneNumber.isPresent()) {
            throw new IllegalArgumentException("Phone number already exists");
        }

        String verificationCode = mailService.generateVerificationCode();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        UserEntity user = UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstname())
                .lastName(request.getLastname())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .verificationCode(verificationCode)
                .verificationCodeExpiry(expiry)
                .build();

        userRepository.save(user);
        mailService.sendVerificationEmail(user, verificationCode);

        return AuthResponse.builder()
                .token(jwtService.getToken(user))
                .build();
    }

    @Override
    public PasswordResetResponse forgotPassword(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No user found with this email address"));

        String verificationCode = mailService.generateVerificationCode();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(expiry);
        userRepository.save(user);

        mailService.sendPasswordResetEmail(user, verificationCode);

        return PasswordResetResponse.builder()
                .message("Password reset instructions have been sent to your email")
                .success(true)
                .build();
    }

    @Override
    public PasswordResetResponse resetPassword(ResetPasswordRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validar el código
        if (user.getVerificationCode() == null ||
                user.getVerificationCodeExpiry() == null ||
                user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset code has expired. Please request a new one.");
        }

        if (!user.getVerificationCode().equals(request.getCode())) {
            throw new IllegalArgumentException("Invalid reset code");
        }

        // Actualizar la contraseña
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);

        return PasswordResetResponse.builder()
                .message("Password has been successfully reset")
                .success(true)
                .build();
    }


}
