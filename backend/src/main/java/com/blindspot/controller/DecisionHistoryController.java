package com.blindspot.controller;

import com.blindspot.dto.SavedDecisionRecordDto;
import com.blindspot.service.DecisionHistoryService;
import com.blindspot.service.FirebaseAuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/decisions")
public class DecisionHistoryController {

    private static final Logger log = LoggerFactory.getLogger(DecisionHistoryController.class);

    private final DecisionHistoryService historyService;
    private final FirebaseAuthService authService;

    public DecisionHistoryController(DecisionHistoryService historyService, FirebaseAuthService authService) {
        this.historyService = historyService;
        this.authService = authService;
    }

    /**
     * GET /api/decisions - Load decisions for authenticated or isolated guest user
     */
    @GetMapping
    public ResponseEntity<List<SavedDecisionRecordDto>> getDecisions(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId) {

        String activeUserId = authService.resolveActiveUserId(authHeader, guestSessionId);
        List<SavedDecisionRecordDto> decisions = historyService.getDecisionsForUser(activeUserId);
        return ResponseEntity.ok(decisions);
    }

    /**
     * POST /api/decisions - Save decision record directly to MongoDB Atlas
     */
    @PostMapping
    public ResponseEntity<?> saveDecision(
            @Valid @RequestBody SavedDecisionRecordDto recordDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId) {

        try {
            Optional<FirebaseAuthService.AuthenticatedUser> authUser = authService.verifyToken(authHeader);
            String effectiveUserId = authUser.map(FirebaseAuthService.AuthenticatedUser::uid)
                    .orElseGet(() -> authService.resolveActiveUserId(authHeader, guestSessionId));
            String userEmail = authUser.map(FirebaseAuthService.AuthenticatedUser::email).orElse(recordDto.userEmail());

            SavedDecisionRecordDto saved = historyService.saveDecision(recordDto, effectiveUserId, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "record", saved,
                    "storageType", "mongodb",
                    "message", "Successfully stored in MongoDB Atlas (Doc ID: " + saved.id() + ")!"
            ));
        } catch (Exception e) {
            log.error("Failed to save decision to MongoDB Atlas: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to save decision record: " + e.getMessage()
            ));
        }
    }

    /**
     * DELETE /api/decisions/{id} - Delete decision record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDecision(
            @PathVariable("id") String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId) {

        String activeUserId = authService.resolveActiveUserId(authHeader, guestSessionId);
        boolean deleted = historyService.deleteDecisionForUser(id, activeUserId);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Decision deleted successfully."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Decision record not found or access denied."));
        }
    }

    /**
     * GET /api/decisions/db-health - Ping MongoDB Atlas connectivity
     */
    @GetMapping("/db-health")
    public ResponseEntity<Map<String, Object>> checkDbHealth() {
        boolean ok = historyService.checkDatabaseHealth();
        long count = historyService.getDecisionCount();
        return ResponseEntity.ok(Map.of(
                "connected", ok,
                "message", ok ? "MongoDB Atlas is actively connected and reachable!" : "MongoDB Atlas connection failed.",
                "count", count,
                "database", "blindspot_db"
        ));
    }
}
