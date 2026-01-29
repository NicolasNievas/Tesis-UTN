package org.example.back.services.imp;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.back.dtos.response.OrderDetailResponse;
import org.example.back.dtos.response.OrderResponse;
import org.example.back.entities.UserEntity;
import org.example.back.enums.ShipmentStatus;
import org.example.back.models.ContactForm;
import org.example.back.repositories.UserRepository;
import org.example.back.services.MailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImp implements MailService {

    private final JavaMailSender emailSender;
    private final UserRepository userRepository;
    private final ResourceLoader resourceLoader;

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
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(userEntity.getEmail());
            helper.setSubject("Verify your email - Coffee Craze");

            String htmlContent = loadEmailTemplate("VerificationEmailTemplate.html");
            htmlContent = htmlContent.replace("{{VERIFICATION_CODE}}", verificationCode);

            helper.setText(htmlContent, true);

            emailSender.send(message);
            log.info("Verification email sent to: {}", userEntity.getEmail());
        } catch (MessagingException | IOException e) {
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

    @Override
    public void sendPasswordResetEmail(UserEntity user, String verificationCode) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset Request - Coffee Craze");

            String htmlContent = loadEmailTemplate("PasswordResetTemplate.html");
            htmlContent = htmlContent.replace("{{USER_NAME}}", user.getFirstName());
            htmlContent = htmlContent.replace("{{RESET_CODE}}", verificationCode);

            helper.setText(htmlContent, true);

            emailSender.send(message);
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (MessagingException | IOException e) {
            log.error("Error sending password reset email", e);
            throw new RuntimeException("Could not send password reset email", e);
        }
    }

    @Override
    public void sendOrderConfirmationEmail(String toEmail, String userName, OrderResponse order) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Order Confirmation - Coffee Craze #" + order.getPaymentId());

            String htmlContent = loadEmailTemplate("OrderConfirmationTemplate.html");

            boolean isLocalPickup = "LOCAL_PICKUP".equals(order.getShippingName());

            String shippingMethod = getShippingMethodDisplayName(order.getShippingName());

            htmlContent = htmlContent.replace("{{USER_NAME}}", userName);
            htmlContent = htmlContent.replace("{{ORDER_ID}}", order.getPaymentId());
            htmlContent = htmlContent.replace("{{ORDER_DATE}}", formatDate(order.getDate()));
            htmlContent = htmlContent.replace("{{ORDER_STATUS}}", order.getStatus().toString());
            htmlContent = htmlContent.replace("{{SHIPPING_METHOD}}", shippingMethod);
            htmlContent = htmlContent.replace("{{ORDER_ITEMS}}", formatOrderItems(order.getDetails()));
            htmlContent = htmlContent.replace("{{SUBTOTAL}}", String.format("%.2f", order.getSubtotal()));
            htmlContent = htmlContent.replace("{{SHIPPING_COST}}", String.format("%.2f", order.getShippingCost()));
            htmlContent = htmlContent.replace("{{TOTAL}}", String.format("%.2f", order.getTotal()));

            if (isLocalPickup) {
                htmlContent = htmlContent.replace("{{DELIVERY_SECTION_TITLE}}", "Pickup Details");
                htmlContent = htmlContent.replace("{{SHIPPING_LABEL}}", "Pickup Fee");

                htmlContent = htmlContent.replace("{{DELIVERY_ADDRESS_ROW}}", "");

                String pickupLocationRow = String.format(
                        "<tr><td style=\"padding: 8px 0; color: #76797e; font-size: 14px;\">Pickup Location:</td>" +
                                "<td style=\"padding: 8px 0; color: #2b373d; font-size: 14px; font-weight: 600; text-align: right;\">%s</td></tr>",
                        "Coffee Craze Store - Córdoba"
                );
                htmlContent = htmlContent.replace("{{PICKUP_LOCATION_ROW}}", pickupLocationRow);

                String pickupInfoBox =
                        "<div style=\"background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px; margin-top: 20px;\">" +
                                "  <p style=\"margin: 0 0 10px 0; color: #2b373d; font-size: 14px; font-weight: 600;\">📍 Pickup Instructions</p>" +
                                "  <p style=\"margin: 0; color: #76797e; font-size: 14px; line-height: 1.6;\">" +
                                "    Your order will be ready for pickup within 24-48 hours. We'll send you another email when it's ready. " +
                                "    Please bring a valid ID when picking up your order." +
                                "  </p>" +
                                "</div>";
                htmlContent = htmlContent.replace("{{DELIVERY_INFO_BOX}}", pickupInfoBox);

                htmlContent = htmlContent.replace("{{NEXT_STEPS_MESSAGE}}",
                        "We'll notify you via email when your order is ready for pickup at our store.");

            } else {
                htmlContent = htmlContent.replace("{{DELIVERY_SECTION_TITLE}}", "Delivery Details");
                htmlContent = htmlContent.replace("{{SHIPPING_LABEL}}", "Shipping");

                String addressInfo = order.getShippingAddress() != null ?
                        order.getShippingAddress() + ", " + order.getShippingCity() : "N/A";
                String deliveryAddressRow = String.format(
                        "<tr><td style=\"padding: 8px 0; color: #76797e; font-size: 14px;\">Delivery Address:</td>" +
                                "<td style=\"padding: 8px 0; color: #2b373d; font-size: 14px; font-weight: 600; text-align: right;\">%s</td></tr>",
                        addressInfo
                );
                htmlContent = htmlContent.replace("{{DELIVERY_ADDRESS_ROW}}", deliveryAddressRow);

                htmlContent = htmlContent.replace("{{PICKUP_LOCATION_ROW}}", "");

                String deliveryInfoBox =
                        "<div style=\"background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px; margin-top: 20px;\">" +
                                "  <p style=\"margin: 0 0 10px 0; color: #2b373d; font-size: 14px; font-weight: 600;\">🚚 Shipping Information</p>" +
                                "  <p style=\"margin: 0; color: #76797e; font-size: 14px; line-height: 1.6;\">" +
                                "    Your order will be shipped soon. You'll receive a tracking number via email once your package is on its way." +
                                "  </p>" +
                                "</div>";
                htmlContent = htmlContent.replace("{{DELIVERY_INFO_BOX}}", deliveryInfoBox);

                htmlContent = htmlContent.replace("{{NEXT_STEPS_MESSAGE}}",
                        "We'll send you tracking information as soon as your order ships.");
            }

            helper.setText(htmlContent, true);

            emailSender.send(message);
            log.info("Order confirmation email sent to: {} (type: {})", toEmail, isLocalPickup ? "PICKUP" : "DELIVERY");
        } catch (MessagingException | IOException e) {
            log.error("Error sending order confirmation email", e);
        }
    }

    @Override
    public void sendTrackingEmail(String toEmail, String userName, OrderResponse order) {
        try {
            if (order.getShipmentInfo() == null || !order.getShipmentInfo().isHasShipment()) {
                log.warn("No shipment info available for order {}", order.getId());
                return;
            }

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your Coffee Craze Order Has Shipped! #" + order.getShipmentInfo().getTrackingCode());

            String htmlContent = loadEmailTemplate("OrderShippedTemplate.html");

            String carrierDisplayName = order.getShippingDisplayName();
            String shippingMethod = getShippingMethodDisplayName(order.getShippingName());
            String estimatedDelivery = order.getShipmentInfo().getEstimatedDeliveryDate() != null ?
                    formatDate(order.getShipmentInfo().getEstimatedDeliveryDate()) : "To be confirmed";
            String shipmentStatus = order.getShipmentInfo().getShipmentStatus() != null ?
                    order.getShipmentInfo().getShipmentStatus().toString() : "In Transit";

            htmlContent = htmlContent.replace("{{USER_NAME}}", userName);
            htmlContent = htmlContent.replace("{{ORDER_ID}}", order.getPaymentId());
            htmlContent = htmlContent.replace("{{TRACKING_CODE}}", order.getShipmentInfo().getTrackingCode());
            htmlContent = htmlContent.replace("{{CARRIER_NAME}}", carrierDisplayName);
            htmlContent = htmlContent.replace("{{SHIPPING_METHOD}}", shippingMethod);
            htmlContent = htmlContent.replace("{{SHIPMENT_STATUS}}", shipmentStatus);
            htmlContent = htmlContent.replace("{{ESTIMATED_DELIVERY}}", estimatedDelivery);
            htmlContent = htmlContent.replace("{{ITEM_COUNT}}", String.valueOf(order.getDetails().size()));
            htmlContent = htmlContent.replace("{{TOTAL_AMOUNT}}", String.format("%.2f", order.getTotal()));
            htmlContent = htmlContent.replace("{{SHIPPING_ADDRESS}}",
                    order.getShippingAddress() != null ? order.getShippingAddress() : "Store Pickup");
            htmlContent = htmlContent.replace("{{SHIPPING_CITY}}",
                    order.getShippingCity() != null ? order.getShippingCity() : "");
            htmlContent = htmlContent.replace("{{POSTAL_CODE}}",
                    order.getShippingPostalCode() != null ? order.getShippingPostalCode() : "");

            helper.setText(htmlContent, true);

            emailSender.send(message);
            log.info("Tracking email sent to: {}", toEmail);
        } catch (MessagingException | IOException e) {
            log.error("Error sending tracking email", e);
        }
    }

    @Override
    public void sendShipmentUpdateEmail(String toEmail, String userName, OrderResponse order, ShipmentStatus newStatus) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);

            // Asunto según el estado
            String subject = getSubjectForStatus(newStatus, order.getShipmentInfo().getTrackingCode());
            helper.setSubject(subject);

            String htmlContent = loadEmailTemplate("ShipmentUpdateTemplate.html");

            // Variables base
            htmlContent = htmlContent.replace("{{USER_NAME}}", userName);
            htmlContent = htmlContent.replace("{{ORDER_ID}}", order.getPaymentId());
            htmlContent = htmlContent.replace("{{TRACKING_CODE}}", order.getShipmentInfo().getTrackingCode());
            htmlContent = htmlContent.replace("{{CARRIER_NAME}}", order.getShippingDisplayName());
            htmlContent = htmlContent.replace("{{SHIPMENT_STATUS}}", newStatus.toString());
            htmlContent = htmlContent.replace("{{LAST_UPDATE_DATE}}", formatDate(LocalDateTime.now()));
            htmlContent = htmlContent.replace("{{RECIPIENT_NAME}}", userName);
            htmlContent = htmlContent.replace("{{SHIPPING_ADDRESS}}",
                    order.getShippingAddress() != null ? order.getShippingAddress() : "");
            htmlContent = htmlContent.replace("{{SHIPPING_CITY}}",
                    order.getShippingCity() != null ? order.getShippingCity() : "");
            htmlContent = htmlContent.replace("{{POSTAL_CODE}}",
                    order.getShippingPostalCode() != null ? order.getShippingPostalCode() : "");

            // Variables específicas del estado
            StatusEmailConfig config = getStatusEmailConfig(newStatus);
            htmlContent = htmlContent.replace("{{BANNER_COLOR}}", config.bannerColor);
            htmlContent = htmlContent.replace("{{STATUS_ICON}}", config.icon);
            htmlContent = htmlContent.replace("{{STATUS_TITLE}}", config.title);
            htmlContent = htmlContent.replace("{{STATUS_MESSAGE}}", config.message);
            htmlContent = htmlContent.replace("{{STATUS_BADGE_COLOR}}", config.badgeColor);
            htmlContent = htmlContent.replace("{{LAST_UPDATE_LOCATION}}", config.location);
            htmlContent = htmlContent.replace("{{LAST_UPDATE_DESCRIPTION}}", config.description);

            // Estimated delivery row (solo si aplica)
            if (newStatus != ShipmentStatus.DELIVERED && order.getShipmentInfo().getEstimatedDeliveryDate() != null) {
                String estimatedDelivery = formatDate(order.getShipmentInfo().getEstimatedDeliveryDate());
                String estimatedRow = String.format(
                        "<tr><td style=\"padding: 8px 0; color: #76797e; font-size: 14px;\">Estimated Delivery:</td>" +
                                "<td style=\"padding: 8px 0; color: #2b373d; font-size: 14px; font-weight: 600; text-align: right;\">%s</td></tr>",
                        estimatedDelivery
                );
                htmlContent = htmlContent.replace("{{ESTIMATED_DELIVERY_ROW}}", estimatedRow);
            } else {
                htmlContent = htmlContent.replace("{{ESTIMATED_DELIVERY_ROW}}", "");
            }

            htmlContent = htmlContent.replace("{{ACTION_BOX}}", config.actionBox);

            helper.setText(htmlContent, true);

            emailSender.send(message);
            log.info("Shipment update email sent to: {} (status: {})", toEmail, newStatus);
        } catch (MessagingException | IOException e) {
            log.error("Error sending shipment update email", e);
        }
    }

    private String getSubjectForStatus(ShipmentStatus status, String trackingCode) {
        return switch (status) {
            case IN_TRANSIT -> "Your Coffee Craze Order is On The Way! #" + trackingCode;
            case DELIVERED -> "Your Coffee Craze Order Has Been Delivered! #" + trackingCode;
            case OUT_FOR_DELIVERY -> "Your Coffee Craze Order is Out for Delivery! #" + trackingCode;
            case READY_FOR_PICKUP -> "Your Coffee Craze Order is Ready for Pickup! #" + trackingCode;
            default -> "Shipment Update - Coffee Craze #" + trackingCode;
        };
    }

    private StatusEmailConfig getStatusEmailConfig(ShipmentStatus status) {
        return switch (status) {
            case IN_TRANSIT -> new StatusEmailConfig(
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    "🚚",
                    "Your Order is On The Way!",
                    "Great news! Your order is in transit and heading to you.",
                    "#3b82f6",
                    "In Transit",
                    "Package is currently being transported to your location",
                    ""
            );
            case OUT_FOR_DELIVERY -> new StatusEmailConfig(
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    "📦",
                    "Out for Delivery Today!",
                    "Your package is out for delivery and should arrive today.",
                    "#f59e0b",
                    "Your City",
                    "Package is out for delivery with the courier",
                    "<div style=\"background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 25px;\">" +
                            "<p style=\"margin: 0; color: #76797e; font-size: 14px; line-height: 1.6;\">" +
                            "<strong style=\"color: #2b373d;\">📍 Delivery Today:</strong><br>" +
                            "Please ensure someone is available to receive the package." +
                            "</p></div>"
            );
            case DELIVERED -> new StatusEmailConfig(
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    "✓",
                    "Order Delivered Successfully!",
                    "Your order has been delivered! We hope you enjoy your Coffee Craze products.",
                    "#10b981",
                    "Delivered",
                    "Package has been successfully delivered",
                    "<div style=\"background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 25px;\">" +
                            "<p style=\"margin: 0; color: #76797e; font-size: 14px; line-height: 1.6;\">" +
                            "<strong style=\"color: #2b373d;\">✓ Delivery Confirmed:</strong><br>" +
                            "Thank you for your purchase! We'd love to hear your feedback." +
                            "</p></div>"
            );
            case READY_FOR_PICKUP -> new StatusEmailConfig(
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    "📍",
                    "Your Order is Ready for Pickup!",
                    "Your order is ready and waiting for you at our Coffee Craze store.",
                    "#8b5cf6",
                    "Coffee Craze Store - Córdoba",
                    "Package is ready for pickup at the store",
                    "<div style=\"background-color: #ede9fe; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 4px; margin-bottom: 25px;\">" +
                            "<p style=\"margin: 0; color: #76797e; font-size: 14px; line-height: 1.6;\">" +
                            "<strong style=\"color: #2b373d;\">📍 Pickup Information:</strong><br>" +
                            "Please bring a valid ID when collecting your order. Store hours: Mon-Sat 9AM-6PM." +
                            "</p></div>"
            );
            default -> new StatusEmailConfig(
                    "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                    "ℹ",
                    "Shipment Update",
                    "There's an update on your shipment.",
                    "#6b7280",
                    "Processing",
                    "Shipment status has been updated",
                    ""
            );
        };
    }

    private String getShippingMethodDisplayName(String shippingName) {
        switch (shippingName) {
            case "LOCAL_PICKUP":
                return "Store Pickup";
            case "OCA":
                return "OCA";
            case "CORREO_ARGENTINO":
                return "Correo Argentino";
            case "ANDREANI":
                return "Andreani";
            default:
                return shippingName;
        }
    }

    private String formatOrderItems(List<OrderDetailResponse> details) {
        StringBuilder items = new StringBuilder();
        for (OrderDetailResponse item : details) {
            items.append(String.format("• %s x%d - $%.2f each = $%.2f%n",
                    item.getProductName(),
                    item.getQuantity(),
                    item.getPrice(),
                    item.getSubtotal()
            ));
        }
        return items.toString();
    }

    private String formatDate(LocalDateTime date) {
        if (date == null) return "To be confirmed";
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String loadEmailTemplate(String templateName) throws IOException {
        String location = "classpath:email-templates/" + templateName;

        try {
            Resource resource = resourceLoader.getResource(location);

            if (!resource.exists()) {
                log.error("Template not found: {}", location);
                throw new IOException("Email template not found: " + templateName);
            }

            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            log.error("Error loading email template: {}", templateName, e);
            throw new IOException("Failed to load email template: " + templateName, e);
        }
    }

    private static class StatusEmailConfig {
        String bannerColor;
        String icon;
        String title;
        String message;
        String badgeColor;
        String location;
        String description;
        String actionBox;

        StatusEmailConfig(String bannerColor, String icon, String title, String message,
                          String badgeColor, String location, String description, String actionBox) {
            this.bannerColor = bannerColor;
            this.icon = icon;
            this.title = title;
            this.message = message;
            this.badgeColor = badgeColor;
            this.location = location;
            this.description = description;
            this.actionBox = actionBox;
        }
    }
}
