package com.blindspot.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ChallengeRequestDto(
    @NotBlank(message = "Decision is required to challenge thinking.")
    String decision,
    String context,
    List<String> options,
    String currentThinking,
    String analysisSummary
) {}
