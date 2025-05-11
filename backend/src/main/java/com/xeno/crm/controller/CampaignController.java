package com.xeno.crm.controller;

import com.xeno.crm.model.Campaign;
import com.xeno.crm.service.AIService;
import com.xeno.crm.service.CampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
@Tag(name = "Campaign Management", description = "APIs for managing marketing campaigns")
public class CampaignController {
    private final CampaignService campaignService;
    private final AIService aiService;

    @PostMapping
    @Operation(summary = "Create a new campaign")
    public ResponseEntity<Campaign> createCampaign(@Valid @RequestBody Campaign campaign) {
        return ResponseEntity.ok(campaignService.createCampaign(campaign));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get campaign by ID")
    public ResponseEntity<Campaign> getCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @GetMapping
    @Operation(summary = "Get all campaigns")
    public ResponseEntity<List<Campaign>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update campaign")
    public ResponseEntity<Campaign> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody Campaign campaignDetails) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, campaignDetails));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete campaign")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/schedule")
    @Operation(summary = "Schedule campaign")
    public ResponseEntity<Void> scheduleCampaign(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledTime) {
        campaignService.scheduleCampaign(id, scheduledTime);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start campaign")
    public ResponseEntity<Void> startCampaign(@PathVariable Long id) {
        campaignService.startCampaign(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete campaign")
    public ResponseEntity<Void> completeCampaign(@PathVariable Long id) {
        campaignService.completeCampaign(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Get campaign statistics")
    public ResponseEntity<Map<String, Object>> getCampaignStats(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignStats(id));
    }

    @GetMapping("/{id}/insights")
    @Operation(summary = "Get AI-generated campaign insights")
    public ResponseEntity<String> getCampaignInsights(@PathVariable Long id) {
        Campaign campaign = campaignService.getCampaignById(id);
        Map<String, Object> stats = campaignService.getCampaignStats(id);
        return ResponseEntity.ok(aiService.generateCampaignInsights(campaign, stats));
    }

    @GetMapping("/{id}/message-variants")
    @Operation(summary = "Get AI-generated message variants")
    public ResponseEntity<List<String>> getMessageVariants(@PathVariable Long id) {
        Campaign campaign = campaignService.getCampaignById(id);
        return ResponseEntity.ok(aiService.generateMessageVariants(campaign));
    }

    @GetMapping("/{id}/optimal-time")
    @Operation(summary = "Get AI-suggested optimal send time")
    public ResponseEntity<LocalDateTime> getOptimalSendTime(@PathVariable Long id) {
        Campaign campaign = campaignService.getCampaignById(id);
        return ResponseEntity.ok(aiService.suggestOptimalSendTime(campaign));
    }

    @GetMapping("/{id}/recommended-images")
    @Operation(summary = "Get AI-recommended product images")
    public ResponseEntity<List<String>> getRecommendedImages(
            @PathVariable Long id,
            @RequestParam String messageTone) {
        return ResponseEntity.ok(aiService.recommendProductImages(messageTone));
    }
} 