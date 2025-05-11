package com.xeno.crm.controller;

import com.xeno.crm.model.Customer;
import com.xeno.crm.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Management", description = "APIs for managing customers")
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create a new customer")
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.createCustomer(customer));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping
    @Operation(summary = "Get all customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody Customer customerDetails) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customerDetails));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/segment/{segment}")
    @Operation(summary = "Get customers by segment")
    public ResponseEntity<List<Customer>> getCustomersBySegment(@PathVariable String segment) {
        return ResponseEntity.ok(customerService.getCustomersBySegment(segment));
    }

    @GetMapping("/inactive")
    @Operation(summary = "Get inactive customers")
    public ResponseEntity<List<Customer>> getInactiveCustomers(
            @RequestParam(defaultValue = "6") int monthsThreshold) {
        return ResponseEntity.ok(customerService.getInactiveCustomers(monthsThreshold));
    }

    @GetMapping("/high-value")
    @Operation(summary = "Get high-value customers")
    public ResponseEntity<List<Customer>> getHighValueCustomers(
            @RequestParam(defaultValue = "10000.0") Double minSpend) {
        return ResponseEntity.ok(customerService.getHighValueCustomers(minSpend));
    }

    @GetMapping("/frequent")
    @Operation(summary = "Get frequent customers")
    public ResponseEntity<List<Customer>> getFrequentCustomers(
            @RequestParam(defaultValue = "5") Integer minOrders) {
        return ResponseEntity.ok(customerService.getFrequentCustomers(minOrders));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get customer statistics")
    public ResponseEntity<Map<String, Object>> getCustomerStats() {
        return ResponseEntity.ok(customerService.getCustomerStats());
    }

    @PatchMapping("/{id}/segment")
    @Operation(summary = "Update customer segment")
    public ResponseEntity<Void> updateCustomerSegment(
            @PathVariable Long id,
            @RequestParam String segment) {
        customerService.updateCustomerSegment(id, segment);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/tags")
    @Operation(summary = "Update customer tags")
    public ResponseEntity<Void> updateCustomerTags(
            @PathVariable Long id,
            @RequestParam String tags) {
        customerService.updateCustomerTags(id, tags);
        return ResponseEntity.ok().build();
    }
} 