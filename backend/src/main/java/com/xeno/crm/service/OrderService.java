package com.xeno.crm.service;

import com.xeno.crm.dto.OrderEventDTO;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String ORDER_TOPIC = "order-events";

    public void createOrder(OrderEventDTO orderEvent) {
        kafkaTemplate.send(ORDER_TOPIC, orderEvent);
    }
} 