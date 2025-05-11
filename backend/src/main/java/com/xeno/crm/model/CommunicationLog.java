package com.xeno.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "communication_logs")
public class CommunicationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull
    @Column(nullable = false)
    private String status; // PENDING, SENT, DELIVERED, FAILED, OPENED, CLICKED

    @Column
    private LocalDateTime sentAt;

    @Column
    private LocalDateTime deliveredAt;

    @Column
    private LocalDateTime openedAt;

    @Column
    private LocalDateTime clickedAt;

    @Column
    private String errorMessage;

    @Column
    private String messageId;

    @Column
    private String channel; // EMAIL, SMS, PUSH_NOTIFICATION

    @Column
    private String recipient;

    @Column
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String messageContent;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private String metadata;
} 