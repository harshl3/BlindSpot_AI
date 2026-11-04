package com.blindspot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ChallengeResponseDto(
    String counterargument,
    String vulnerableAssumption,
    String alternativeInterpretation,
    String secondOrderConsequence,
    List<String> challengingQuestions,
    EvidenceConsiderations evidenceConsiderations
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EvidenceConsiderations(
        String strengthens,
        String weakens
    ) {}
}
