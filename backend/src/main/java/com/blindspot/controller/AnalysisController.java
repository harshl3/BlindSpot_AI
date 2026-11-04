package com.blindspot.controller;

import com.blindspot.dto.BlindSpotAnalysisDto;
import com.blindspot.dto.ChallengeRequestDto;
import com.blindspot.dto.ChallengeResponseDto;
import com.blindspot.dto.DecisionInputDto;
import com.blindspot.dto.PremortemRequestDto;
import com.blindspot.dto.PremortemResponseDto;
import com.blindspot.service.GeminiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalysisController {

    private static final Logger log = LoggerFactory.getLogger(AnalysisController.class);
    private final GeminiService geminiService;

    public AnalysisController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@Valid @RequestBody DecisionInputDto input) {
        try {
            if (input.decision() == null || input.decision().trim().length() < 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "Invalid input: 'decision' must be a descriptive string of at least 5 characters."
                ));
            }

            if (input.options() == null || input.options().stream().filter(o -> o != null && !o.isBlank()).count() < 2) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "Invalid input: You must provide at least two distinct options to evaluate."
                ));
            }

            BlindSpotAnalysisDto analysis = geminiService.generateBlindSpotAnalysis(input);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            log.error("[API /analyze error]", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Failed to generate decision analysis. Please try again."
            ));
        }
    }

    @PostMapping("/challenge")
    public ResponseEntity<?> challenge(@Valid @RequestBody ChallengeRequestDto input) {
        try {
            if (input.decision() == null || input.decision().trim().length() < 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "Missing or invalid 'decision' in request."
                ));
            }

            ChallengeResponseDto challenge = geminiService.generateChallengeThinking(input);
            return ResponseEntity.ok(challenge);
        } catch (Exception e) {
            log.error("[API /challenge error]", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Failed to challenge thinking. Please try again."
            ));
        }
    }

    @PostMapping("/premortem")
    public ResponseEntity<?> premortem(@Valid @RequestBody PremortemRequestDto input) {
        try {
            if (input.decision() == null || input.decision().trim().length() < 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "Missing or invalid 'decision' in request."
                ));
            }

            PremortemResponseDto premortem = geminiService.generatePremortem(input);
            return ResponseEntity.ok(premortem);
        } catch (Exception e) {
            log.error("[API /premortem error]", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Failed to generate pre-mortem. Please try again."
            ));
        }
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    }
}
