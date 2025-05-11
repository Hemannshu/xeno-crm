package com.xeno.crm.service;

import com.xeno.crm.model.Customer;
import com.xeno.crm.repository.CustomerRepository;
import com.xeno.crm.dto.CustomerEventDTO;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String CUSTOMER_TOPIC = "customer-events";

    @Transactional
    public Customer createCustomer(Customer customer) {
        // Publish to Kafka instead of saving directly
        CustomerEventDTO event = new CustomerEventDTO();
        event.setId(customer.getId());
        event.setFirstName(customer.getFirstName());
        event.setLastName(customer.getLastName());
        event.setEmail(customer.getEmail());
        event.setPhone(customer.getPhone());
        event.setAddress(customer.getAddress());
        event.setCity(customer.getCity());
        event.setState(customer.getState());
        event.setCountry(customer.getCountry());
        event.setPostalCode(customer.getPostalCode());
        event.setActive(customer.getActive());
        event.setSegment(customer.getSegment());
        event.setTags(customer.getTags());
        kafkaTemplate.send(CUSTOMER_TOPIC, event);
        // Return the input object for now (actual persistence is async)
        return customer;
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = getCustomerById(id);
        customer.setFirstName(customerDetails.getFirstName());
        customer.setLastName(customerDetails.getLastName());
        customer.setEmail(customerDetails.getEmail());
        customer.setPhone(customerDetails.getPhone());
        customer.setAddress(customerDetails.getAddress());
        customer.setCity(customerDetails.getCity());
        customer.setState(customerDetails.getState());
        customer.setCountry(customerDetails.getCountry());
        customer.setPostalCode(customerDetails.getPostalCode());
        customer.setActive(customerDetails.getActive());
        customer.setSegment(customerDetails.getSegment());
        customer.setTags(customerDetails.getTags());
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> getCustomersBySegment(String segment) {
        return customerRepository.findBySegment(segment);
    }

    @Transactional(readOnly = true)
    public List<Customer> getInactiveCustomers(int monthsThreshold) {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(monthsThreshold);
        return customerRepository.findInactiveCustomers(threshold);
    }

    @Transactional(readOnly = true)
    public List<Customer> getHighValueCustomers(Double minSpend) {
        return customerRepository.findHighValueCustomers(minSpend);
    }

    @Transactional(readOnly = true)
    public List<Customer> getFrequentCustomers(Integer minOrders) {
        return customerRepository.findFrequentCustomers(minOrders);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCustomerStats() {
        Map<String, Object> stats = Map.of(
            "totalCustomers", customerRepository.count(),
            "activeCustomers", customerRepository.countBySegment("ACTIVE"),
            "highValueCustomers", customerRepository.findHighValueCustomers(10000.0).size(),
            "averageSpend", customerRepository.getAverageSpendBySegment("ACTIVE")
        );
        return stats;
    }

    @Transactional
    public void updateCustomerSegment(Long id, String segment) {
        Customer customer = getCustomerById(id);
        customer.setSegment(segment);
        customerRepository.save(customer);
    }

    @Transactional
    public void updateCustomerTags(Long id, String tags) {
        Customer customer = getCustomerById(id);
        customer.setTags(tags);
        customerRepository.save(customer);
    }
} 