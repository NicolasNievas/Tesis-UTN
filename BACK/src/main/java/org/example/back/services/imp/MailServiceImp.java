package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.back.entities.UserEntity;
import org.example.back.models.ContactForm;
import org.example.back.repositories.UserRepository;
import org.example.back.services.MailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImp implements MailService {

    private final JavaMailSender emailSender;
    private final UserRepository userRepository;

    @Value("${email.username}")
    private String destinationEmail;

    @Override
    public void sendEmail(ContactForm contactForm) {
        validateForm(contactForm);
        sendEmailToApp(contactForm);
    }

    @Override
    public String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    @Override
    public void sendVerificationEmail(UserEntity userEntity, String verificationCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(userEntity.getEmail());
        message.setSubject("Verify your email - Coffee Craze");
        message.setText(String.format("""
            Welcome to Coffee Craze!
            
            Your verification code is: %s
            
            This code will expire in 15 minutes.
            Please enter this code in the application to verify your email address.
            
            Best regards,
            Coffee Craze Team
            """, verificationCode));

        try {
            emailSender.send(message);
            log.info("Verification email sent to: {}", userEntity.getEmail());
        } catch (MailException e) {
            log.error("Error sending verification email", e);
            throw new RuntimeException("Could not send verification email", e);
        }
    }

    @Override
    public void verifyEmail(String email, String verificationCode) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email already verified");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            String newVerificationCode = generateVerificationCode();
            LocalDateTime newExpiry = LocalDateTime.now().plusMinutes(15);

            user.setVerificationCode(newVerificationCode);
            user.setVerificationCodeExpiry(newExpiry);
            userRepository.save(user);

            sendVerificationEmail(user, newVerificationCode);

            throw new IllegalArgumentException("Verification code expired. A new code has been sent to your email address");
        }

        if (!user.getVerificationCode().equals(verificationCode)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
    }

    private void validateForm(ContactForm contactForm) {
        if (contactForm == null) {
            throw new IllegalArgumentException("The form cannot be empty");
        }
        if (StringUtils.isEmpty(contactForm.getName())) {
            throw new IllegalArgumentException("Please enter your name");
        }
        if (StringUtils.isEmpty(contactForm.getEmail())) {
            throw new IllegalArgumentException("Please enter your email address");
        }
        if (!isValidEmail(contactForm.getEmail())) {
            throw new IllegalArgumentException("Please enter a valid email address");
        }
        if (StringUtils.isEmpty(contactForm.getMessage())) {
            throw new IllegalArgumentException("Please enter your message");
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    private void sendEmailToApp(ContactForm contactForm) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinationEmail);
        message.setSubject("Nuevo mensaje de contacto desde tu sitio web - Coffee Craze");
        message.setText(createEmailContent(contactForm));

        try {
            emailSender.send(message);
            log.info("Mensaje de contacto enviado desde: {}", contactForm.getEmail());
        } catch (MailException e) {
            log.error("Error al enviar mensaje de contacto", e);
            throw new RuntimeException("No se pudo enviar el mensaje. Por favor, intente más tarde.", e);
        }
    }

    private String createEmailContent(ContactForm form) {
        return String.format("""
            Nuevo mensaje de contacto:
            
            Nombre: %s
            Email: %s
            Mensaje:
            %s
            """,
                form.getName(),
                form.getEmail(),
                form.getMessage()
        );
    }
}
