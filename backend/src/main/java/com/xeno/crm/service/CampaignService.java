package com.xeno.crm.service;

import com.xeno.crm.model.Campaign;
import com.xeno.crm.model.CommunicationLog;
import com.xeno.crm.model.Customer;
import com.xeno.crm.repository.CampaignRepository;
import com.xeno.crm.repository.CommunicationLogRepository;
import com.xeno.crm.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CampaignService {
    private final CampaignRepository campaignRepository;
    private final CustomerRepository customerRepository;
    private final CommunicationLogRepository communicationLogRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Random random = new Random();

    @Transactional
    public Campaign createCampaign(Campaign campaign) {
        campaign.setStatus("DRAFT");
        return campaignRepository.save(campaign);
    }

    @Transactional(readOnly = true)
    public Campaign getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Campaign not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @Transactional
    public Campaign updateCampaign(Long id, Campaign campaignDetails) {
        Campaign campaign = getCampaignById(id);
        campaign.setName(campaignDetails.getName());
        campaign.setDescription(campaignDetails.getDescription());
        campaign.setType(campaignDetails.getType());
        campaign.setMessageTemplate(campaignDetails.getMessageTemplate());
        campaign.setSubject(campaignDetails.getSubject());
        campaign.setSegmentRules(campaignDetails.getSegmentRules());
        campaign.setScheduledTime(campaignDetails.getScheduledTime());
        campaign.setTags(campaignDetails.getTags());
        return campaignRepository.save(campaign);
    }

    @Transactional
    public void deleteCampaign(Long id) {
        Campaign campaign = getCampaignById(id);
        campaignRepository.delete(campaign);
    }

    @Transactional
    public void scheduleCampaign(Long id, LocalDateTime scheduledTime) {
        Campaign campaign = getCampaignById(id);
        campaign.setStatus("SCHEDULED");
        campaign.setScheduledTime(scheduledTime);
        campaignRepository.save(campaign);
    }

    @Transactional
    public void startCampaign(Long id) {
        Campaign campaign = getCampaignById(id);
        campaign.setStatus("RUNNING");
        campaign.setStartTime(LocalDateTime.now());
        campaignRepository.save(campaign);

        // Get target audience based on segment rules
        List<Customer> targetAudience = getTargetAudience(campaign.getSegmentRules());
        campaign.setTargetAudienceSize(targetAudience.size());
        campaignRepository.save(campaign);

        // Send messages to target audience
        for (Customer customer : targetAudience) {
            sendMessage(campaign, customer);
        }
    }

    @Transactional
    public void completeCampaign(Long id) {
        Campaign campaign = getCampaignById(id);
        campaign.setStatus("COMPLETED");
        campaign.setEndTime(LocalDateTime.now());
        campaignRepository.save(campaign);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCampaignStats(Long id) {
        Campaign campaign = getCampaignById(id);
        Long deliveredCount = communicationLogRepository.countByCampaignIdAndStatus(id, "DELIVERED");
        Long failedCount = communicationLogRepository.countByCampaignIdAndStatus(id, "FAILED");
        Long openedCount = communicationLogRepository.countByCampaignIdAndStatus(id, "OPENED");
        Long clickedCount = communicationLogRepository.countByCampaignIdAndStatus(id, "CLICKED");

        return Map.of(
            "campaignId", id,
            "campaignName", campaign.getName(),
            "targetAudienceSize", campaign.getTargetAudienceSize(),
            "deliveredCount", deliveredCount,
            "failedCount", failedCount,
            "openRate", calculateRate(openedCount, deliveredCount),
            "clickRate", calculateRate(clickedCount, deliveredCount),
            "averageDeliveryTime", communicationLogRepository.getAverageDeliveryTimeByCampaign(id)
        );
    }

    private List<Customer> getTargetAudience(String segmentRules) {
        // TODO: Implement segment rule parsing and customer filtering
        // For now, return all active customers
        return customerRepository.findByActive(true);
    }

    private void sendMessage(Campaign campaign, Customer customer) {
        // Simulate message sending with 90% success rate
        boolean success = random.nextDouble() < 0.9;

        CommunicationLog log = new CommunicationLog();
        log.setCampaign(campaign);
        log.setCustomer(customer);
        log.setStatus(success ? "SENT" : "FAILED");
        log.setSentAt(LocalDateTime.now());
        log.setChannel(campaign.getType());
        log.setRecipient(customer.getEmail());
        log.setSubject(campaign.getSubject());
        log.setMessageContent(campaign.getMessageTemplate());

        if (success) {
            log.setDeliveredAt(LocalDateTime.now());
            log.setStatus("DELIVERED");
        } else {
            log.setErrorMessage("Simulated delivery failure");
        }

        communicationLogRepository.save(log);

        // Update campaign stats
        campaign.setDeliveredCount(campaign.getDeliveredCount() + (success ? 1 : 0));
        campaign.setFailedCount(campaign.getFailedCount() + (success ? 0 : 1));
        campaignRepository.save(campaign);
    }

    private double calculateRate(Long count, Long total) {
        if (total == null || total == 0) {
            return 0.0;
        }
        return (double) count / total;
    }
} 