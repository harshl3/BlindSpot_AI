package com.blindspot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record DecisionInputDto(
    @NotBlank(message = "Decision statement is required and must be at least 5 characters.")
    @Size(min = 5, max = 1000, message = "Decision statement must be between 5 and 1000 characters.")
    String decision,

    String context,

    @NotEmpty(message = "At least two distinct options must be provided.")
    @Size(min = 2, message = "At least two options are required.")
    List<String> options,

    String priorities,

    String currentThinking
) {}
