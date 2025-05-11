package com.xeno.crm.kafka;

import com.xeno.crm.dto.CustomerEventDTO;
import com.xeno.crm.model.Customer;
import com.xeno.crm.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerEventConsumer {
    private final CustomerRepository customerRepository;

    @KafkaListener(topics = "customer-events", groupId = "crm-group")
    @Transactional
    public void consumeCustomerEvent(CustomerEventDTO event) {
        log.info("Received customer event: {}", event);
        Customer customer = new Customer();
        customer.setFirstName(event.getFirstName());
        customer.setLastName(event.getLastName());
        customer.setEmail(event.getEmail());
        customer.setPhone(event.getPhone());
        customer.setAddress(event.getAddress());
        customer.setCity(event.getCity());
        customer.setState(event.getState());
        customer.setCountry(event.getCountry());
        customer.setPostalCode(event.getPostalCode());
        customer.setActive(event.getActive());
        customer.setSegment(event.getSegment());
        customer.setTags(event.getTags());
        customerRepository.save(customer);
    }
} 