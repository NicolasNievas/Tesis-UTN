package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import org.example.back.dtos.AuthResponse;
import org.example.back.dtos.LoginRequest;
import org.example.back.dtos.RegisterRequest;
import org.example.back.entities.Role;
import org.example.back.entities.UserEntity;
import org.example.back.jwt.JwtService;
import org.example.back.repositories.UserRepository;
import org.example.back.services.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImp implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Invalid data");
        }

        UserDetails user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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

        UserEntity user = UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstname())
                .lastName(request.getLastname())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .role(Role.CUSTOMER)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .token(jwtService.getToken(user))
                .build();
    }
}
