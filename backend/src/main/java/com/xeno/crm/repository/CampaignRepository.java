package com.xeno.crm.repository;

import com.xeno.crm.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByStatus(String status);
    
    List<Campaign> findByType(String type);
    
    @Query("SELECT c FROM Campaign c WHERE c.scheduledTime >= ?1 AND c.scheduledTime <= ?2")
    List<Campaign> findScheduledCampaigns(LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT c FROM Campaign c WHERE c.createdAt >= ?1 AND c.createdAt <= ?2")
    List<Campaign> findCampaignsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT c FROM Campaign c WHERE c.targetAudienceSize > 0 ORDER BY c.targetAudienceSize DESC")
    List<Campaign> findTopCampaignsByAudienceSize();
    
    @Query("SELECT c FROM Campaign c WHERE c.deliveredCount > 0 ORDER BY (CAST(c.openedCount AS double) / c.deliveredCount) DESC")
    List<Campaign> findTopCampaignsByOpenRate();
    
    @Query("SELECT c FROM Campaign c WHERE c.deliveredCount > 0 ORDER BY (CAST(c.clickedCount AS double) / c.deliveredCount) DESC")
    List<Campaign> findTopCampaignsByClickRate();
    
    @Query("SELECT COUNT(c) FROM Campaign c WHERE c.status = ?1")
    Long countByStatus(String status);
    
    @Query("SELECT AVG(c.deliveredCount) FROM Campaign c WHERE c.status = 'COMPLETED'")
    Double getAverageDeliveryCount();
    
    @Query("SELECT c FROM Campaign c WHERE c.segmentRules LIKE %?1%")
    List<Campaign> findBySegmentRule(String rule);
} 