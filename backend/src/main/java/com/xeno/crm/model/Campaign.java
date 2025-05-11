package com.xeno.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "campaigns")
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @NotNull
    @Column(nullable = false)
    private String status; // DRAFT, SCHEDULED, RUNNING, COMPLETED, FAILED

    @Column
    private LocalDateTime scheduledTime;

    @Column
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Column
    private String type; // EMAIL, SMS, PUSH_NOTIFICATION

    @Column(columnDefinition = "TEXT")
    private String messageTemplate;

    @Column
    private String subject;

    @Column
    private String segmentRules;

    @Column
    private Integer targetAudienceSize;

    @Column
    private Integer deliveredCount;

    @Column
    private Integer failedCount;

    @Column
    private Integer openedCount;

    @Column
    private Integer clickedCount;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL)
    private List<CommunicationLog> communicationLogs = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private String createdBy;

    @Column
    private String tags;

    @Column
    private String aiGeneratedVariants;

    @Column
    private String aiInsights;
} 