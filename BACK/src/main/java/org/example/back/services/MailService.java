package org.example.back.services;

import org.example.back.dtos.response.OrderResponse;
import org.example.back.entities.UserEntity;
import org.example.back.enums.ShipmentStatus;
import org.example.back.models.ContactForm;
import org.springframework.stereotype.Service;

@Service
public interface MailService {
    void sendEmail(ContactForm contactForm);
    String generateVerificationCode();
    void sendVerificationEmail(UserEntity userEntity, String verificationCode);
    void verifyEmail(String email,String verificationCode);
    void sendPasswordResetEmail(UserEntity user, String verificationCode);
    void sendOrderConfirmationEmail(String toEmail, String userName, OrderResponse order);
    void sendTrackingEmail(String toEmail, String userName, OrderResponse order);
    void sendShipmentUpdateEmail(String toEmail, String userName, OrderResponse order, ShipmentStatus newStatus);
}
