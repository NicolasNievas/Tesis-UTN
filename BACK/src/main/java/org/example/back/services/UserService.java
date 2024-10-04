package org.example.back.services;

import org.example.back.models.User;
import org.springframework.stereotype.Service;

@Service
public interface UserService {
    User getCurrentUser();
    User getUserProfile(String email);
}
