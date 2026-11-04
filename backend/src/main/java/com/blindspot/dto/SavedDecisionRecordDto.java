package com.blindspot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SavedDecisionRecordDto(
    String id,
    String userId,
    String userEmail,
    DecisionInputDto input,
    BlindSpotAnalysisDto analysis,
    ChallengeResponseDto challengeResult,
    PremortemResponseDto premortemResult,
    UserReflectionDto reflection,
    String createdAt,
    String updatedAt
) {}
