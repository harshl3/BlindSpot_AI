package com.blindspot.service;

import com.blindspot.dto.SavedDecisionRecordDto;
import com.blindspot.model.DecisionDocument;
import com.blindspot.repository.DecisionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class DecisionHistoryService {

    private static final Logger log = LoggerFactory.getLogger(DecisionHistoryService.class);

    private final DecisionRepository decisionRepository;
    private final MongoTemplate mongoTemplate;

    public DecisionHistoryService(DecisionRepository decisionRepository, MongoTemplate mongoTemplate) {
        this.decisionRepository = decisionRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public SavedDecisionRecordDto saveDecision(SavedDecisionRecordDto dto, String authenticatedUserId, String userEmail) {
        String nowIso = Instant.now().toString();
        String effectiveUserId = authenticatedUserId != null && !authenticatedUserId.isBlank()
                ? authenticatedUserId
                : (dto.userId() != null && !dto.userId().isBlank() ? dto.userId() : "guest_user");

        DecisionDocument doc = new DecisionDocument();
        if (dto.id() != null && !dto.id().isBlank() && !dto.id().startsWith("local_")) {
            // Updating existing document if authorized
            Optional<DecisionDocument> existing = decisionRepository.findByIdAndUserId(dto.id(), effectiveUserId);
            if (existing.isPresent()) {
                doc = existing.get();
            }
        }

        doc.setUserId(effectiveUserId);
        doc.setUserEmail(userEmail != null ? userEmail : dto.userEmail());
        doc.setInput(dto.input());
        doc.setAnalysis(dto.analysis());
        doc.setChallengeResult(dto.challengeResult());
        doc.setPremortemResult(dto.premortemResult());
        doc.setReflection(dto.reflection());
        doc.setUpdatedAt(Instant.now());
        doc.setUpdatedAtIso(nowIso);

        if (doc.getCreatedAt() == null) {
            doc.setCreatedAt(Instant.now());
            doc.setCreatedAtIso(nowIso);
        }

        DecisionDocument saved = decisionRepository.save(doc);
        log.info("Saved decision document in MongoDB Atlas (ID: {}, User: {})", saved.getId(), saved.getUserId());

        return toDto(saved);
    }

    public List<SavedDecisionRecordDto> getDecisionsForUser(String userId) {
        if (userId == null || userId.isBlank() || "guest_default".equals(userId)) {
            // For public / evaluator mode if no user token or session is provided, load latest
            return decisionRepository.findAllByOrderByCreatedAtDesc()
                    .stream()
                    .map(this::toDto)
                    .toList();
        }

        return decisionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public boolean deleteDecisionForUser(String id, String userId) {
        if (id == null || id.isBlank()) return false;

        // If specific user, ensure user owns document
        if (userId != null && !userId.isBlank() && !"guest_default".equals(userId)) {
            Optional<DecisionDocument> doc = decisionRepository.findByIdAndUserId(id, userId);
            if (doc.isPresent()) {
                decisionRepository.delete(doc.get());
                log.info("Deleted decision {} for user {}", id, userId);
                return true;
            }
            return false;
        }

        // Guest or fallback delete
        if (decisionRepository.existsById(id)) {
            decisionRepository.deleteById(id);
            log.info("Deleted decision {} via direct ID", id);
            return true;
        }
        return false;
    }

    public boolean checkDatabaseHealth() {
        try {
            org.bson.Document ping = mongoTemplate.executeCommand("{ ping: 1 }");
            return ping.containsKey("ok") && ((Number) ping.get("ok")).intValue() == 1;
        } catch (Exception e) {
            log.error("MongoDB Atlas health check failed: {}", e.getMessage());
            return false;
        }
    }

    public long getDecisionCount() {
        try {
            return decisionRepository.count();
        } catch (Exception e) {
            return 0;
        }
    }

    private SavedDecisionRecordDto toDto(DecisionDocument doc) {
        return new SavedDecisionRecordDto(
                doc.getId(),
                doc.getUserId(),
                doc.getUserEmail(),
                doc.getInput(),
                doc.getAnalysis(),
                doc.getChallengeResult(),
                doc.getPremortemResult(),
                doc.getReflection(),
                doc.getCreatedAtIso() != null ? doc.getCreatedAtIso() : (doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : Instant.now().toString()),
                doc.getUpdatedAtIso() != null ? doc.getUpdatedAtIso() : (doc.getUpdatedAt() != null ? doc.getUpdatedAt().toString() : Instant.now().toString())
        );
    }
}
