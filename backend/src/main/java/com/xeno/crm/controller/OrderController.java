package com.xeno.crm.controller;

import com.xeno.crm.dto.OrderEventDTO;
import com.xeno.crm.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for managing orders")
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Ingest a new order")
    public ResponseEntity<Void> createOrder(@Valid @RequestBody OrderEventDTO orderEvent) {
        orderService.createOrder(orderEvent);
        return ResponseEntity.ok().build();
    }
} 