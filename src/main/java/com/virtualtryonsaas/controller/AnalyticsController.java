package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.dto.ActivityDto;
import com.virtualtryonsaas.dto.DashboardMetricsDto;
import com.virtualtryonsaas.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, maxAge = 3600, allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsDto> getDashboardMetrics() {
        DashboardMetricsDto metrics = analyticsService.getDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }
    
    @GetMapping("/recent-activities")
    public ResponseEntity<List<ActivityDto>> getRecentActivities() {
        List<ActivityDto> activities = analyticsService.getRecentActivities();
        return ResponseEntity.ok(activities);
    }
}
