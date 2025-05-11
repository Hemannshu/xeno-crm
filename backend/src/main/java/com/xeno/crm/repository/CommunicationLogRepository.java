package com.xeno.crm.repository;

import com.xeno.crm.model.CommunicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, Long> {
    List<CommunicationLog> findByCampaignId(Long campaignId);
    
    List<CommunicationLog> findByCustomerId(Long customerId);
    
    List<CommunicationLog> findByStatus(String status);
    
    @Query("SELECT cl FROM CommunicationLog cl WHERE cl.campaign.id = ?1 AND cl.status = ?2")
    List<CommunicationLog> findByCampaignIdAndStatus(Long campaignId, String status);
    
    @Query("SELECT COUNT(cl) FROM CommunicationLog cl WHERE cl.campaign.id = ?1 AND cl.status = ?2")
    Long countByCampaignIdAndStatus(Long campaignId, String status);
    
    @Query("SELECT cl FROM CommunicationLog cl WHERE cl.sentAt >= ?1 AND cl.sentAt <= ?2")
    List<CommunicationLog> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT cl FROM CommunicationLog cl WHERE cl.campaign.id = ?1 ORDER BY cl.sentAt DESC")
    List<CommunicationLog> findLatestByCampaignId(Long campaignId);
    
    @Query("SELECT cl FROM CommunicationLog cl WHERE cl.customer.id = ?1 ORDER BY cl.sentAt DESC")
    List<CommunicationLog> findLatestByCustomerId(Long customerId);
    
    @Query("SELECT COUNT(cl) FROM CommunicationLog cl WHERE cl.campaign.id = ?1")
    Long countByCampaignId(Long campaignId);
    
    @Query("SELECT COUNT(cl) FROM CommunicationLog cl WHERE cl.customer.id = ?1")
    Long countByCustomerId(Long customerId);
    
    @Query("SELECT AVG(TIMESTAMPDIFF(SECOND, cl.sentAt, cl.deliveredAt)) FROM CommunicationLog cl WHERE cl.status = 'DELIVERED' AND cl.campaign.id = ?1")
    Double getAverageDeliveryTimeByCampaign(Long campaignId);
} 