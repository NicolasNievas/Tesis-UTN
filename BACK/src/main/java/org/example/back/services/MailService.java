package org.example.back.services;

import org.example.back.models.ContactForm;
import org.springframework.stereotype.Service;

@Service
public interface MailService {
    void sendEmail(ContactForm contactForm);
}
