package com.blindspot.controller;

import com.blindspot.service.DecisionHistoryService;
import com.blindspot.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final GeminiService geminiService;
    private final DecisionHistoryService historyService;

    public HealthController(GeminiService geminiService, DecisionHistoryService historyService) {
        this.geminiService = geminiService;
        this.historyService = historyService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean dbOk = historyService.checkDatabaseHealth();
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "BlindSpot Spring Boot 3.4 API (Java 21)",
                "geminiConfigured", geminiService.isConfigured(),
                "databaseConnected", dbOk,
                "timestamp", Instant.now().toString()
        ));
    }
}
