package com.blindspot;

import com.blindspot.controller.DecisionHistoryController;
import com.blindspot.dto.BlindSpotAnalysisDto;
import com.blindspot.dto.DecisionInputDto;
import com.blindspot.dto.SavedDecisionRecordDto;
import com.blindspot.service.DecisionHistoryService;
import com.blindspot.service.FirebaseAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DecisionHistoryController.class)
public class DecisionHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DecisionHistoryService historyService;

    @MockitoBean
    private FirebaseAuthService authService;

    @Test
    public void testGetDecisionsForUser() throws Exception {
        Mockito.when(authService.resolveActiveUserId(any(), any())).thenReturn("user_123");

        SavedDecisionRecordDto mockRecord = new SavedDecisionRecordDto(
                "doc_1",
                "user_123",
                "user@example.com",
                new DecisionInputDto("Decision statement", "Context", List.of("A", "B"), "Priorities", "Thinking"),
                new BlindSpotAnalysisDto("Summary", List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), "Reflect"),
                null,
                null,
                null,
                "2026-10-28T00:00:00Z",
                "2026-10-28T00:00:00Z"
        );

        Mockito.when(historyService.getDecisionsForUser("user_123")).thenReturn(List.of(mockRecord));

        mockMvc.perform(get("/api/decisions")
                        .header("Authorization", "Bearer mock_valid_token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("doc_1"))
                .andExpect(jsonPath("$[0].userId").value("user_123"));
    }

    @Test
    public void testSaveDecisionRecord() throws Exception {
        Mockito.when(authService.verifyToken(any())).thenReturn(Optional.of(new FirebaseAuthService.AuthenticatedUser("user_abc", "abc@example.com", false)));

        SavedDecisionRecordDto inputRecord = new SavedDecisionRecordDto(
                null,
                "user_abc",
                "abc@example.com",
                new DecisionInputDto("Decision statement", "Context", List.of("A", "B"), "Priorities", "Thinking"),
                new BlindSpotAnalysisDto("Summary", List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), "Reflect"),
                null,
                null,
                null,
                null,
                null
        );

        SavedDecisionRecordDto savedRecord = new SavedDecisionRecordDto(
                "mongo_generated_id_999",
                "user_abc",
                "abc@example.com",
                inputRecord.input(),
                inputRecord.analysis(),
                null,
                null,
                null,
                "2026-10-28T01:00:00Z",
                "2026-10-28T01:00:00Z"
        );

        Mockito.when(historyService.saveDecision(any(), eq("user_abc"), eq("abc@example.com"))).thenReturn(savedRecord);

        mockMvc.perform(post("/api/decisions")
                        .header("Authorization", "Bearer valid_token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputRecord)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.storageType").value("mongodb"))
                .andExpect(jsonPath("$.record.id").value("mongo_generated_id_999"));
    }

    @Test
    public void testDeleteDecisionRecord() throws Exception {
        Mockito.when(authService.resolveActiveUserId(any(), any())).thenReturn("user_abc");
        Mockito.when(historyService.deleteDecisionForUser("doc_delete_1", "user_abc")).thenReturn(true);

        mockMvc.perform(delete("/api/decisions/doc_delete_1")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testCheckDbHealth() throws Exception {
        Mockito.when(historyService.checkDatabaseHealth()).thenReturn(true);
        Mockito.when(historyService.getDecisionCount()).thenReturn(5L);

        mockMvc.perform(get("/api/decisions/db-health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(true))
                .andExpect(jsonPath("$.database").value("blindspot_db"))
                .andExpect(jsonPath("$.count").value(5));
    }
}
