package com.blindspot.model;

import com.blindspot.dto.BlindSpotAnalysisDto;
import com.blindspot.dto.ChallengeResponseDto;
import com.blindspot.dto.DecisionInputDto;
import com.blindspot.dto.PremortemResponseDto;
import com.blindspot.dto.UserReflectionDto;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "decisions")
public class DecisionDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String userEmail;

    private DecisionInputDto input;

    private BlindSpotAnalysisDto analysis;

    private ChallengeResponseDto challengeResult;

    private PremortemResponseDto premortemResult;

    private UserReflectionDto reflection;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    private String createdAtIso;

    private String updatedAtIso;

    public DecisionDocument() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public DecisionInputDto getInput() { return input; }
    public void setInput(DecisionInputDto input) { this.input = input; }

    public BlindSpotAnalysisDto getAnalysis() { return analysis; }
    public void setAnalysis(BlindSpotAnalysisDto analysis) { this.analysis = analysis; }

    public ChallengeResponseDto getChallengeResult() { return challengeResult; }
    public void setChallengeResult(ChallengeResponseDto challengeResult) { this.challengeResult = challengeResult; }

    public PremortemResponseDto getPremortemResult() { return premortemResult; }
    public void setPremortemResult(PremortemResponseDto premortemResult) { this.premortemResult = premortemResult; }

    public UserReflectionDto getReflection() { return reflection; }
    public void setReflection(UserReflectionDto reflection) { this.reflection = reflection; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedAtIso() { return createdAtIso; }
    public void setCreatedAtIso(String createdAtIso) { this.createdAtIso = createdAtIso; }

    public String getUpdatedAtIso() { return updatedAtIso; }
    public void setUpdatedAtIso(String updatedAtIso) { this.updatedAtIso = updatedAtIso; }
}
