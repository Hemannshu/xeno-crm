package com.xeno.crm.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderEventDTO implements Serializable {
    private Long id;
    private Long customerId;
    private String orderNumber;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String status;
    private String paymentMethod;
    private String shippingAddress;
    private String shippingMethod;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private List<OrderItemDTO> items;
    private String notes;

    @Data
    public static class OrderItemDTO implements Serializable {
        private String productId;
        private String productName;
        private Double unitPrice;
        private Integer quantity;
        private Double totalPrice;
        private String productCategory;
        private String productVariant;
        private String notes;
    }
} 