package com.blindspot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PremortemResponseDto(
    String failureScenario,
    List<String> plausibleContributingFactors,
    List<String> earlyWarningSigns,
    List<String> preventiveQuestions,
    List<String> riskReductionActions
) {}
