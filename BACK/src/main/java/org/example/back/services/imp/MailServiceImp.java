package org.example.back.services.imp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.back.models.ContactForm;
import org.example.back.services.MailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImp implements MailService {

    private final JavaMailSender emailSender;

    @Value("${email.username}")
    private String destinationEmail;

    @Override
    public void sendEmail(ContactForm contactForm) {
        validateForm(contactForm);
        sendEmailToApp(contactForm);
    }

    private void validateForm(ContactForm contactForm) {
        if (contactForm == null) {
            throw new IllegalArgumentException("El formulario no puede estar vacío");
        }
        if (StringUtils.isEmpty(contactForm.getName())) {
            throw new IllegalArgumentException("Por favor, ingrese su nombre");
        }
        if (StringUtils.isEmpty(contactForm.getEmail())) {
            throw new IllegalArgumentException("Por favor, ingrese su correo electrónico");
        }
        if (!isValidEmail(contactForm.getEmail())) {
            throw new IllegalArgumentException("Por favor, ingrese un correo electrónico válido");
        }
        if (StringUtils.isEmpty(contactForm.getMessage())) {
            throw new IllegalArgumentException("Por favor, ingrese su mensaje");
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
