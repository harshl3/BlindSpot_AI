package com.blindspot;

import com.blindspot.controller.AnalysisController;
import com.blindspot.dto.BlindSpotAnalysisDto;
import com.blindspot.dto.ChallengeRequestDto;
import com.blindspot.dto.ChallengeResponseDto;
import com.blindspot.dto.DecisionInputDto;
import com.blindspot.dto.PremortemRequestDto;
import com.blindspot.dto.PremortemResponseDto;
import com.blindspot.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalysisController.class)
public class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GeminiService geminiService;

    @Test
    public void testAnalyzeRejectsDecisionUnder5Chars() throws Exception {
        DecisionInputDto input = new DecisionInputDto(
                "Quit",
                "Context",
                List.of("Option A", "Option B"),
                "Priorities",
                "Thinking"
        );

        mockMvc.perform(post("/api/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    public void testAnalyzeRejectsLessThanTwoOptions() throws Exception {
        DecisionInputDto input = new DecisionInputDto(
                "Should we migrate the monolith?",
                "Context",
                List.of("Only one option"),
                "Priorities",
                "Thinking"
        );

        mockMvc.perform(post("/api/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    public void testAnalyzeSucceedsWithValidPayload() throws Exception {
        DecisionInputDto input = new DecisionInputDto(
                "Should we rewrite the frontend or refactor incrementally?",
                "Technical debt is high.",
                List.of("Full rewrite in Next.js", "Incremental refactor"),
                "Speed to market",
                "Incremental seems safer"
        );

        BlindSpotAnalysisDto mockResponse = new BlindSpotAnalysisDto(
                "User is comparing full rewrite against incremental refactor.",
                List.of(new BlindSpotAnalysisDto.AssumptionItem("Next.js will solve velocity", "Crucial", "Is framework the issue?", "medium")),
                List.of(new BlindSpotAnalysisDto.BlindSpotItem("Team learning curve", "Delay delivery", "Run a 1-week spike")),
                List.of(new BlindSpotAnalysisDto.RiskItem("Scope creep", "Over-optimism", "Missed sprint 2", "Strict boundary", "high")),
                List.of(new BlindSpotAnalysisDto.PerspectiveItem("Product Owner", "Wants features")),
                List.of(new BlindSpotAnalysisDto.QuestionItem("What is current lead time?", "Baseline")),
                List.of(new BlindSpotAnalysisDto.EvidenceGapItem("Component reusability stats", "High", "Analyze git churn")),
                "What assumption might be incorrect?"
        );

        Mockito.when(geminiService.generateBlindSpotAnalysis(any(DecisionInputDto.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.decisionSummary").value("User is comparing full rewrite against incremental refactor."))
                .andExpect(jsonPath("$.assumptions[0].statement").value("Next.js will solve velocity"))
                .andExpect(jsonPath("$.blindSpots[0].factor").value("Team learning curve"));
    }

    @Test
    public void testChallengeThinkingSucceeds() throws Exception {
        ChallengeRequestDto request = new ChallengeRequestDto(
                "Return to office 5 days a week",
                "Engineering department",
                List.of("Mandate 5 days", "Stay hybrid"),
                "In person presence boosts culture",
                "Strong executive pressure"
        );

        ChallengeResponseDto mockResponse = new ChallengeResponseDto(
                "Presence does not guarantee collaboration and causes attrition.",
                "Employees collaborate effectively in open plan offices.",
                "Spontaneous chats may create more distraction than depth.",
                "Senior talent departs quietly over 6-9 months.",
                List.of("Have you measured asynchronous output?"),
                new ChallengeResponseDto.EvidenceConsiderations("Lower voluntary turnover", "Higher PR merge velocity")
        );

        Mockito.when(geminiService.generateChallengeThinking(any(ChallengeRequestDto.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/challenge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.counterargument").exists())
                .andExpect(jsonPath("$.vulnerableAssumption").exists());
    }

    @Test
    public void testPremortemSucceeds() throws Exception {
        PremortemRequestDto request = new PremortemRequestDto(
                "Launch autonomous customer AI bot",
                "E-commerce helpdesk",
                "100% rollout immediately",
                "6 months"
        );

        PremortemResponseDto mockResponse = new PremortemResponseDto(
                "The bot hallucinated non-existent return policies and escalated churn.",
                List.of("Lack of guardrails on policy queries"),
                List.of("Customer support ticket spike in week 3"),
                List.of("What is our instant killswitch?"),
                List.of("Roll out to 5% sample cohort first")
        );

        Mockito.when(geminiService.generatePremortem(any(PremortemRequestDto.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/premortem")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.failureScenario").exists())
                .andExpect(jsonPath("$.plausibleContributingFactors").isArray());
    }
}
