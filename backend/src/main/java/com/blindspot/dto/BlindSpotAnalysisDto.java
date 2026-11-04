package com.blindspot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BlindSpotAnalysisDto(
    String decisionSummary,
    List<AssumptionItem> assumptions,
    List<BlindSpotItem> blindSpots,
    List<RiskItem> risks,
    List<PerspectiveItem> perspectives,
    List<QuestionItem> questions,
    List<EvidenceGapItem> evidenceGaps,
    String reflectionPrompt
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AssumptionItem(
        String statement,
        String whyItMatters,
        String question,
        String confidence
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record BlindSpotItem(
        String factor,
        String impact,
        String nextStep
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RiskItem(
        String risk,
        String reason,
        String warningSign,
        String mitigation,
        String uncertainty
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PerspectiveItem(
        String viewpoint,
        String reasoning
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record QuestionItem(
        String question,
        String purpose
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EvidenceGapItem(
        String unknown,
        String importance,
        String verification
    ) {}
}
