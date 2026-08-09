package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.OrderConfirmationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOrderConfirmation(OrderConfirmationRequest order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getCustomer().getEmail());
            helper.setSubject("Order Confirmation - " + order.getOrderId());
            helper.setFrom("noreply@fashionstore.com");

            String emailContent = buildOrderConfirmationEmail(order);
            helper.setText(emailContent, true);

            mailSender.send(message);
            log.info("Order confirmation email sent to: {}", order.getCustomer().getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send email", e);
            throw new RuntimeException("Failed to send order confirmation email", e);
        }
    }

    private String buildOrderConfirmationEmail(OrderConfirmationRequest order) {
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderConfirmationRequest.OrderItem item : order.getItems()) {
            itemsHtml.append(String.format(
                "<tr>" +
                    "<td style='padding: 12px; border-bottom: 1px solid #eee;'>%s (Size: %s)</td>" +
                    "<td style='padding: 12px; border-bottom: 1px solid #eee; text-align: center;'>%d</td>" +
                    "<td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right;'>$%.2f</td>" +
                    "<td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;'>$%.2f</td>" +
                "</tr>",
                item.getName(),
                item.getSize(),
                item.getQuantity(),
                item.getPrice(),
                item.getTotal()
            ));
        }

        return String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "    <meta charset='UTF-8'>" +
            "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;'>" +
            "    <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);'>" +
            "        <!-- Header -->" +
            "        <div style='background: linear-gradient(135deg, #000000 0%%, #1a1a1a 100%%); padding: 30px; text-align: center;'>" +
            "            <h1 style='color: #ffffff; margin: 0; font-size: 28px;'>Fashion Store</h1>" +
            "            <p style='color: #b0b0b0; margin: 10px 0 0 0;'>AI-Powered Virtual Try-On</p>" +
            "        </div>" +
            "" +
            "        <!-- Success Message -->" +
            "        <div style='padding: 30px; text-align: center; background-color: #f0f9ff; border-bottom: 3px solid #4caf50;'>" +
            "            <div style='width: 60px; height: 60px; background-color: #4caf50; border-radius: 50%%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;'>" +
            "                <span style='color: white; font-size: 30px;'>✓</span>" +
            "            </div>" +
            "            <h2 style='color: #333; margin: 0 0 10px 0;'>Order Confirmed!</h2>" +
            "            <p style='color: #666; margin: 0;'>Thank you for your purchase</p>" +
            "        </div>" +
            "" +
            "        <!-- Order Details -->" +
            "        <div style='padding: 30px;'>" +
            "            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;'>" +
            "                <h3 style='margin: 0 0 15px 0; color: #333;'>Order Information</h3>" +
            "                <table style='width: 100%%; border-collapse: collapse;'>" +
            "                    <tr>" +
            "                        <td style='padding: 8px 0; color: #666;'>Order ID:</td>" +
            "                        <td style='padding: 8px 0; text-align: right; font-weight: bold; color: #333;'>%s</td>" +
            "                    </tr>" +
            "                    <tr>" +
            "                        <td style='padding: 8px 0; color: #666;'>Order Date:</td>" +
            "                        <td style='padding: 8px 0; text-align: right; color: #333;'>%s</td>" +
            "                    </tr>" +
            "                    <tr>" +
            "                        <td style='padding: 8px 0; color: #666;'>Payment Status:</td>" +
            "                        <td style='padding: 8px 0; text-align: right;'>" +
            "                            <span style='background-color: #4caf50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;'>%s</span>" +
            "                        </td>" +
            "                    </tr>" +
            "                </table>" +
            "            </div>" +
            "" +
            "            <!-- Shipping Address -->" +
            "            <div style='margin-bottom: 25px;'>" +
            "                <h3 style='margin: 0 0 15px 0; color: #333;'>Shipping Address</h3>" +
            "                <div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; color: #666; line-height: 1.6;'>" +
            "                    <strong style='color: #333;'>%s</strong><br>" +
            "                    %s<br>" +
            "                    %s, %s %s<br>" +
            "                    %s<br>" +
            "                    <br>" +
            "                    <strong style='color: #333;'>Contact:</strong><br>" +
            "                    Email: %s<br>" +
            "                    Phone: %s" +
            "                </div>" +
            "            </div>" +
            "" +
            "            <!-- Order Items -->" +
            "            <div style='margin-bottom: 25px;'>" +
            "                <h3 style='margin: 0 0 15px 0; color: #333;'>Order Items</h3>" +
            "                <table style='width: 100%%; border-collapse: collapse; background-color: #f9f9f9; border-radius: 8px; overflow: hidden;'>" +
            "                    <thead>" +
            "                        <tr style='background-color: #e0e0e0;'>" +
            "                            <th style='padding: 12px; text-align: left; color: #333;'>Product</th>" +
            "                            <th style='padding: 12px; text-align: center; color: #333;'>Qty</th>" +
            "                            <th style='padding: 12px; text-align: right; color: #333;'>Price</th>" +
            "                            <th style='padding: 12px; text-align: right; color: #333;'>Total</th>" +
            "                        </tr>" +
            "                    </thead>" +
            "                    <tbody>" +
            "                        %s" +
            "                    </tbody>" +
            "                </table>" +
            "            </div>" +
            "" +
            "            <!-- Order Summary -->" +
            "            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px;'>" +
            "                <h3 style='margin: 0 0 15px 0; color: #333;'>Order Summary</h3>" +
            "                <table style='width: 100%%; border-collapse: collapse;'>" +
            "                    <tr>" +
            "                        <td style='padding: 8px 0; color: #666;'>Subtotal:</td>" +
            "                        <td style='padding: 8px 0; text-align: right; color: #333;'>$%s</td>" +
            "                    </tr>" +
            "                    <tr>" +
            "                        <td style='padding: 8px 0; color: #666;'>Shipping:</td>" +
            "                        <td style='padding: 8px 0; text-align: right; color: #333;'>$%s</td>" +
            "                    </tr>" +
            "                    <tr>" +
            "                        <td style='padding: 8px 0; color: #666;'>Tax:</td>" +
            "                        <td style='padding: 8px 0; text-align: right; color: #333;'>$%s</td>" +
            "                    </tr>" +
            "                    <tr style='border-top: 2px solid #ddd;'>" +
            "                        <td style='padding: 12px 0 0 0; font-size: 18px; font-weight: bold; color: #333;'>Total:</td>" +
            "                        <td style='padding: 12px 0 0 0; text-align: right; font-size: 24px; font-weight: bold; color: #4caf50;'>$%s</td>" +
            "                    </tr>" +
            "                </table>" +
            "            </div>" +
            "        </div>" +
            "" +
            "        <!-- Footer -->" +
            "        <div style='background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #ddd;'>" +
            "            <p style='color: #666; margin: 0 0 10px 0; font-size: 14px;'>Thank you for shopping with Fashion Store!</p>" +
            "            <p style='color: #999; margin: 0; font-size: 12px;'>If you have any questions, please contact us at support@fashionstore.com</p>" +
            "        </div>" +
            "    </div>" +
            "</body>" +
            "</html>",
            order.getOrderId(),
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
            order.getPayment().getStatus(),
            order.getCustomer().getName(),
            order.getShippingAddress().getAddress(),
            order.getShippingAddress().getCity(),
            order.getShippingAddress().getState(),
            order.getShippingAddress().getZipCode(),
            order.getShippingAddress().getCountry(),
            order.getCustomer().getEmail(),
            order.getCustomer().getPhone(),
            itemsHtml.toString(),
            order.getPricing().getSubtotal(),
            order.getPricing().getShipping(),
            order.getPricing().getTax(),
            order.getPricing().getTotal()
        );
    }
}
