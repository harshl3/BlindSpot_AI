package com.blindspot;

import com.blindspot.dto.DecisionInputDto;
import com.blindspot.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class GeminiServiceTest {

    private GeminiService geminiService;

    @BeforeEach
    public void setup() {
        geminiService = new GeminiService(
                "",
                "gemini-3.5-flash-lite,gemini-flash-lite-latest",
                new ObjectMapper()
        );
    }

    @Test
    public void testCleanJsonTextRemovesMarkdownCodeFences() {
        String fencedJson = "```json\n{\"decisionSummary\": \"Test summary\"}\n```";
        String cleaned = geminiService.cleanJsonText(fencedJson);
        assertEquals("{\"decisionSummary\": \"Test summary\"}", cleaned);

        String genericFenced = "```\n{\"key\": \"val\"}\n```";
        String genericCleaned = geminiService.cleanJsonText(genericFenced);
        assertEquals("{\"key\": \"val\"}", genericCleaned);
    }

    @Test
    public void testCleanJsonTextHandlesAlreadyCleanJson() {
        String clean = "{\"decisionSummary\": \"Test\"}";
        assertEquals(clean, geminiService.cleanJsonText(clean));
    }

    @Test
    public void testGenerateBlindSpotAnalysisThrowsOnShortDecision() {
        DecisionInputDto shortInput = new DecisionInputDto(
                "No",
                "",
                List.of("A", "B"),
                "",
                ""
        );

        assertThrows(IllegalArgumentException.class, () -> {
            geminiService.generateBlindSpotAnalysis(shortInput);
        });
    }

    @Test
    public void testGenerateBlindSpotAnalysisThrowsOnLessThanTwoOptions() {
        DecisionInputDto singleOption = new DecisionInputDto(
                "Valid decision statement here",
                "",
                List.of("Only one"),
                "",
                ""
        );

        assertThrows(IllegalArgumentException.class, () -> {
            geminiService.generateBlindSpotAnalysis(singleOption);
        });
    }
}
