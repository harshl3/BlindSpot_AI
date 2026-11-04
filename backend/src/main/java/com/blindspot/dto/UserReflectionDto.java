package com.blindspot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserReflectionDto(
    String state,
    String notes,
    String savedAt,
    List<String> checkedAspects
) {}
