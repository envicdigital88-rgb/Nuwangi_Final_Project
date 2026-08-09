package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.ActivityDto;
import com.virtualtryonsaas.dto.DashboardMetricsDto;
import com.virtualtryonsaas.entity.Product;
import com.virtualtryonsaas.entity.User;
import com.virtualtryonsaas.repository.ProductRepository;
import com.virtualtryonsaas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public DashboardMetricsDto getDashboardMetrics() {
        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();
        
        DashboardMetricsDto metrics = new DashboardMetricsDto();
        metrics.setTotalCustomers(totalCustomers);
        metrics.setTotalProducts(totalProducts);
        metrics.setTotalTryOns(8750);
        metrics.setConversionRate(12.5);
        metrics.setAverageRating(4.8);
        metrics.setNewCustomersThisMonth(45);
        
        return metrics;
    }
    
    public List<ActivityDto> getRecentActivities() {
        List<ActivityDto> activities = new ArrayList<>();
        
        // Get recent customers
        List<User> recentCustomers = userRepository.findAll(
            PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        for (User customer : recentCustomers) {
            String timeAgo = getTimeAgo(customer.getCreatedAt());
            activities.add(new ActivityDto(
                "New customer registered: " + customer.getFirstName() + " " + customer.getLastName(),
                timeAgo,
                "success.main",
                customer.getCreatedAt()
            ));
        }
        
        // Get recent products
        List<Product> recentProducts = productRepository.findAll(
            PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        for (Product product : recentProducts) {
            if (product.getCreatedAt() != null) {
                String timeAgo = getTimeAgo(product.getCreatedAt());
                activities.add(new ActivityDto(
                    "New product added: \"" + product.getName() + "\"",
                    timeAgo,
                    "primary.main",
                    product.getCreatedAt()
                ));
            }
        }
        
        // Sort by timestamp descending
        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        
        // Return top 5
        return activities.size() > 5 ? activities.subList(0, 5) : activities;
    }
    
    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "recently";
        
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();
        
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + (minutes == 1 ? " minute ago" : " minutes ago");
        if (hours < 24) return hours + (hours == 1 ? " hour ago" : " hours ago");
        return days + (days == 1 ? " day ago" : " days ago");
    }
}