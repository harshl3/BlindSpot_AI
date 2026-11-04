package com.blindspot;

import com.blindspot.controller.HealthController;
import com.blindspot.service.DecisionHistoryService;
import com.blindspot.service.GeminiService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthController.class)
public class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GeminiService geminiService;

    @MockitoBean
    private DecisionHistoryService historyService;

    @Test
    public void testHealthEndpointReturnsOk() throws Exception {
        Mockito.when(geminiService.isConfigured()).thenReturn(true);
        Mockito.when(historyService.checkDatabaseHealth()).thenReturn(true);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.geminiConfigured").value(true))
                .andExpect(jsonPath("$.databaseConnected").value(true));
    }
}
