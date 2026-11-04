package com.blindspot.dto;

import jakarta.validation.constraints.NotBlank;

public record PremortemRequestDto(
    @NotBlank(message = "Decision is required to run a pre-mortem.")
    String decision,
    String context,
    String chosenOption,
    String timeHorizon
) {}
