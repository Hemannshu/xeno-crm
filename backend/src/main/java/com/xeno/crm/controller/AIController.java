package com.xeno.crm.controller;

import com.xeno.crm.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "APIs for AI-powered features")
public class AIController {
    private final AIService aiService;

    @PostMapping("/segment-rules")
    @Operation(summary = "Generate segment rules from natural language")
    public ResponseEntity<String> generateSegmentRules(@RequestBody String naturalLanguageQuery) {
        return ResponseEntity.ok(aiService.generateSegmentRules(naturalLanguageQuery));
    }

    @PostMapping("/message-variants")
    @Operation(summary = "Generate message variants for a campaign")
    public ResponseEntity<List<String>> generateMessageVariants(
            @RequestParam String campaignName,
            @RequestParam String campaignType,
            @RequestParam String description,
            @RequestParam String targetAudience) {
        // Create a temporary campaign object for the AI service
        com.xeno.crm.model.Campaign campaign = new com.xeno.crm.model.Campaign();
        campaign.setName(campaignName);
        campaign.setType(campaignType);
        campaign.setDescription(description);
        campaign.setSegmentRules(targetAudience);
        return ResponseEntity.ok(aiService.generateMessageVariants(campaign));
    }

    @GetMapping("/optimal-time")
    @Operation(summary = "Get AI-suggested optimal send time")
    public ResponseEntity<LocalDateTime> getOptimalSendTime(
            @RequestParam String campaignType,
            @RequestParam String targetAudience) {
        // Create a temporary campaign object for the AI service
        com.xeno.crm.model.Campaign campaign = new com.xeno.crm.model.Campaign();
        campaign.setType(campaignType);
        campaign.setSegmentRules(targetAudience);
        return ResponseEntity.ok(aiService.suggestOptimalSendTime(campaign));
    }

    @GetMapping("/recommended-images")
    @Operation(summary = "Get AI-recommended product images")
    public ResponseEntity<List<String>> getRecommendedImages(@RequestParam String messageTone) {
        return ResponseEntity.ok(aiService.recommendProductImages(messageTone));
    }
} 