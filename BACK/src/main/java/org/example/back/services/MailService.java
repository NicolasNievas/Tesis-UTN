package org.example.back.services;

import org.example.back.entities.UserEntity;
import org.example.back.models.ContactForm;
import org.springframework.stereotype.Service;

@Service
public interface MailService {
    void sendEmail(ContactForm contactForm);
    String generateVerificationCode();
    void sendVerificationEmail(UserEntity userEntity, String verificationCode);
    void verifyEmail(String email,String verificationCode);
}
