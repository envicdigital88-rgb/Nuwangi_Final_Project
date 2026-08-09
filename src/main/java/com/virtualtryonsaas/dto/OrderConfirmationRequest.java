package com.virtualtryonsaas.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderConfirmationRequest {
    private String orderId;
    private CustomerInfo customer;
    private ShippingAddress shippingAddress;
    private List<OrderItem> items;
    private PaymentInfo payment;
    private PricingInfo pricing;
    private String orderDate;

    @Data
    public static class CustomerInfo {
        private String name;
        private String email;
        private String phone;
    }

    @Data
    public static class ShippingAddress {
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data
    public static class OrderItem {
        private Long productId;
        private String name;
        private String size;
        private Integer quantity;
        private Double price;
        private Double total;
    }

    @Data
    public static class PaymentInfo {
        private String method;
        private String status;
    }

    @Data
    public static class PricingInfo {
        private String subtotal;
        private String shipping;
        private String tax;
        private String total;
    }
}
