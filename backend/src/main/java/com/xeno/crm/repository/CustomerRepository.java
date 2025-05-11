package com.xeno.crm.repository;

import com.xeno.crm.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByEmail(String email);
    
    List<Customer> findBySegment(String segment);
    
    List<Customer> findByActive(Boolean active);
    
    @Query("SELECT c FROM Customer c WHERE c.lastOrderDate < ?1")
    List<Customer> findInactiveCustomers(LocalDateTime threshold);
    
    @Query("SELECT c FROM Customer c WHERE c.totalSpent >= ?1")
    List<Customer> findHighValueCustomers(Double minSpend);
    
    @Query("SELECT c FROM Customer c WHERE c.orderCount >= ?1")
    List<Customer> findFrequentCustomers(Integer minOrders);
    
    @Query("SELECT c FROM Customer c WHERE c.createdAt >= ?1 AND c.createdAt <= ?2")
    List<Customer> findCustomersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.segment = ?1")
    Long countBySegment(String segment);
    
    @Query("SELECT AVG(c.totalSpent) FROM Customer c WHERE c.segment = ?1")
    Double getAverageSpendBySegment(String segment);
} 