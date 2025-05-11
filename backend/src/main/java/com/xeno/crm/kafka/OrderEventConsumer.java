package com.xeno.crm.kafka;

import com.xeno.crm.dto.OrderEventDTO;
import com.xeno.crm.model.Customer;
import com.xeno.crm.model.Order;
import com.xeno.crm.model.OrderItem;
import com.xeno.crm.repository.CustomerRepository;
import com.xeno.crm.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    @KafkaListener(topics = "order-events", groupId = "crm-group")
    @Transactional
    public void consumeOrderEvent(OrderEventDTO event) {
        log.info("Received order event: {}", event);
        Customer customer = customerRepository.findById(event.getCustomerId()).orElse(null);
        if (customer == null) {
            log.warn("Customer not found for order event: {}", event);
            return;
        }
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber(event.getOrderNumber());
        order.setOrderDate(event.getOrderDate());
        order.setTotalAmount(event.getTotalAmount());
        order.setStatus(event.getStatus());
        order.setPaymentMethod(event.getPaymentMethod());
        order.setShippingAddress(event.getShippingAddress());
        order.setShippingMethod(event.getShippingMethod());
        order.setShippedDate(event.getShippedDate());
        order.setDeliveredDate(event.getDeliveredDate());
        order.setNotes(event.getNotes());
        if (event.getItems() != null) {
            for (OrderEventDTO.OrderItemDTO itemDTO : event.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProductId(itemDTO.getProductId());
                item.setProductName(itemDTO.getProductName());
                item.setUnitPrice(itemDTO.getUnitPrice());
                item.setQuantity(itemDTO.getQuantity());
                item.setTotalPrice(itemDTO.getTotalPrice());
                item.setProductCategory(itemDTO.getProductCategory());
                item.setProductVariant(itemDTO.getProductVariant());
                item.setNotes(itemDTO.getNotes());
                order.getItems().add(item);
            }
        }
        orderRepository.save(order);
    }
} 