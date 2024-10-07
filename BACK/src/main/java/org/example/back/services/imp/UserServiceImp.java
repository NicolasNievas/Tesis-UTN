package org.example.back.services.imp;

import org.example.back.dtos.UpdateUserRequest;
import org.example.back.entities.UserEntity;
import org.example.back.models.User;
import org.example.back.repositories.UserRepository;
import org.example.back.services.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return getUserProfile(email);
    }

    @Override
    public User getUserProfile(String email) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con email: " + email));
        return mapUserEntityToUser(userEntity);
    }

    @Override
    @Transactional
    public User updateUserProfile(String email, UpdateUserRequest request) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con email: " + email));

        if (request.getFirstName() != null) {
            userEntity.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            userEntity.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            userEntity.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            userEntity.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            userEntity.setCity(request.getCity());
        }

        UserEntity updatedUserEntity = userRepository.save(userEntity);
        return mapUserEntityToUser(updatedUserEntity);
    }

    private User mapUserEntityToUser(UserEntity userEntity) {
        return User.builder()
                .id(userEntity.getId())
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .email(userEntity.getEmail())
                .phoneNumber(userEntity.getPhoneNumber())
                .address(userEntity.getAddress())
                .city(userEntity.getCity())
                .role(userEntity.getRole())
                .build();
    }
}