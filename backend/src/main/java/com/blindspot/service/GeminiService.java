package com.blindspot.service;

import com.blindspot.dto.BlindSpotAnalysisDto;
import com.blindspot.dto.ChallengeRequestDto;
import com.blindspot.dto.ChallengeResponseDto;
import com.blindspot.dto.DecisionInputDto;
import com.blindspot.dto.PremortemRequestDto;
import com.blindspot.dto.PremortemResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    private final String apiKey;
    private final List<String> candidateModels;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.models:gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.8-flash,gemini-3.5-flash}") String modelsConfig,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        List<String> parsed = (modelsConfig != null && !modelsConfig.isBlank())
                ? java.util.Arrays.stream(modelsConfig.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList()
                : List.of("gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-3.5-flash");
        this.candidateModels = !parsed.isEmpty()
                ? parsed
                : List.of("gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-3.5-flash");

        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(java.time.Duration.ofSeconds(5));
        requestFactory.setReadTimeout(java.time.Duration.ofSeconds(20));

        this.restClient = RestClient.builder()
                .baseUrl(GEMINI_BASE_URL)
                .requestFactory(requestFactory)
                .build();
        this.objectMapper = objectMapper;

        if (this.apiKey.isEmpty()) {
            log.warn("⚠️ Warning: GEMINI_API_KEY is not defined in environment variables. Gemini calls will require key or mock.");
        } else {
            log.info("🔑 Gemini AI initialized with {} candidate models. Primary: {}",
                    this.candidateModels.size(), this.candidateModels.get(0));
        }
    }

    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    /**
     * Executes Gemini call with fallback across models and retry on rate-limiting.
     */
    public String callGeminiWithFallback(String prompt, String systemInstruction) {
        if (!isConfigured()) {
            throw new IllegalStateException("Gemini API key is not configured on the server. Please set GEMINI_API_KEY.");
        }

        Exception lastException = null;

        for (String modelName : candidateModels) {
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    Map<String, Object> body = Map.of(
                            "contents", List.of(
                                    Map.of("parts", List.of(Map.of("text", prompt)))
                            ),
                            "systemInstruction", Map.of(
                                    "parts", List.of(Map.of("text", systemInstruction != null ? systemInstruction : ""))
                            ),
                            "generationConfig", Map.of(
                                    "temperature", 0.3,
                                    "maxOutputTokens", 6000,
                                    "responseMimeType", "application/json"
                            )
                    );

                    final int currentAttempt = attempt;
                    String responseJson = restClient.post()
                            .uri("/models/{model}:generateContent?key={key}", modelName, apiKey)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(body)
                            .retrieve()
                            .onStatus(HttpStatusCode::isError, (req, resp) -> {
                                String errBody = new String(resp.getBody().readAllBytes());
                                log.warn("[Gemini] Model {} attempt {} HTTP {}: {}",
                                        modelName, currentAttempt, resp.getStatusCode(), errBody);
                                throw new RuntimeException("Gemini HTTP " + resp.getStatusCode() + ": " + errBody);
                            })
                            .body(String.class);

                    if (responseJson != null) {
                        JsonNode root = objectMapper.readTree(responseJson);
                        JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
                        if (!textNode.isMissingNode()) {
                            log.info("⚡ [Gemini] Successfully generated response with model: {}", modelName);
                            return textNode.asText();
                        }
                    }
                } catch (Exception e) {
                    lastException = e;
                    String msg = e.getMessage() != null ? e.getMessage() : "";
                    log.warn("[Gemini] Model {} attempt {} failed: {}", modelName, attempt, msg);

                    // If 503 (high demand) or 404 (not found / deprecated), failover immediately to next candidate
                    if (msg.contains("503") || msg.contains("404") || msg.toLowerCase().contains("high demand")) {
                        log.info("⏩ [Gemini] Model {} unavailable ({}); immediately switching to next model candidate...",
                                modelName, msg.contains("503") ? "503 High Demand" : "404 Not Found");
                        break; // Advance to next model immediately without delay
                    } else if (msg.contains("429")) {
                        // Rate limit: brief backoff
                        try {
                            Thread.sleep(600L * attempt);
                        } catch (InterruptedException ignored) {
                            Thread.currentThread().interrupt();
                        }
                    } else {
                        break; // Unknown or non-retryable error, try next candidate
                    }
                }
            }
        }

        throw new RuntimeException("All Gemini models failed. Last error: " + (lastException != null ? lastException.getMessage() : "Unknown"));
    }

    /**
     * Cleans markdown JSON wrappers (```json ... ```) before parsing.
     */
    public String cleanJsonText(String rawText) {
        if (rawText == null) return "{}";
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
        }
        return cleaned.trim();
    }

    /**
     * Section C: Full BlindSpot Structured Analysis
     */
    public BlindSpotAnalysisDto generateBlindSpotAnalysis(DecisionInputDto input) {
        String decision = input.decision() != null ? input.decision().trim() : "";
        String context = input.context() != null ? input.context().trim() : "None provided";
        List<String> options = input.options() != null ? input.options() : List.of();
        String priorities = input.priorities() != null ? input.priorities().trim() : "None specified";
        String currentThinking = input.currentThinking() != null ? input.currentThinking().trim() : "Undisclosed";

        if (decision.length() < 5) {
            throw new IllegalArgumentException("A specific decision statement (at least 5 characters) is required.");
        }
        if (options.stream().filter(o -> o != null && !o.isBlank()).count() < 2) {
            throw new IllegalArgumentException("At least two distinct options must be provided for examination.");
        }

        String systemInstruction = """
            You are BlindSpot, a friendly, practical, and down-to-earth thinking partner.
            Your job is to help users think through dilemmas clearly, spot what they might be missing, and weigh real-world trade-offs before choosing.

            CRITICAL TONE & LANGUAGE RULES (STRICT):
            1. WRITE LIKE A SMART, EMPATHETIC HUMAN FRIEND, NOT AN ACADEMIC PAPER OR ROBOT.
               - Speak in plain, everyday English.
               - STRICTLY FORBIDDEN BUZZWORDS: Do NOT use phrases like "execution velocity", "cognitive impairment",
                 "error-compounding", "utility", "forgo", "falsify", "heuristics", "salience", "epistemic",
                 "catastrophic judgment failure", or "substantive delta".
               - Use natural, friendly words: "getting tired", "sloppy mistakes", "running out of time", "burnout",
                 "staying focused", "fixing bugs later", "peace of mind".
            2. MATCH THE SCOPE OF THE QUESTION:
               - If the user asks a simple lifestyle question (e.g. "sleep or not sleep", "order food or cook", "take a break"), respond with relatable, everyday common sense and practical daily consequences.
               - If the user asks a business or technical question, keep it plain, realistic, and grounded.
            3. DO NOT INVENT FAKE CORPORATE PRIORITIES:
               - If the user entered simple or empty priorities, do NOT hallucinate complex jargon like "balance immediate execution velocity against long-term risk". Summarize what they actually asked in 1-2 simple sentences.
            4. KEEP SENTENCES SHORT AND PUNCHY:
               - Avoid long, winding sentences.
               - Every point should be easy to skim and understand in under 5 seconds.
            5. Return strictly valid JSON adhering to the required schema.
            """;

        String prompt = String.format("""
            Analyze this decision situation and return a concise, easy-to-read, structured JSON report written in simple, everyday language.

            DECISION: "%s"
            CONTEXT: "%s"
            OPTIONS: %s
            PRIORITIES / WHAT MATTERS MOST: "%s"
            CURRENT THINKING / BELIEF: "%s"

            Return a JSON object with EXACTLY this structure:
            {
              "decisionSummary": "A clear, natural 1-2 sentence overview of the dilemma and what matters to the user, using everyday words.",
              "assumptions": [
                {
                  "statement": "A plain-English guess the user might be taking for granted",
                  "whyItMatters": "Why this guess matters if it turns out to be wrong",
                  "question": "A simple, friendly question to test whether this assumption holds up",
                  "confidence": "low | medium | high"
                }
              ],
              "blindSpots": [
                {
                  "factor": "An overlooked detail or surprise that could pop up",
                  "impact": "How this could complicate things or create headaches later",
                  "nextStep": "A simple, concrete thing to verify today"
                }
              ],
              "risks": [
                {
                  "risk": "A realistic risk, drawback, or trade-off in simple words",
                  "reason": "Why this could happen under the current plan",
                  "warningSign": "An early clue or red flag that tells you things are going sideways",
                  "mitigation": "A practical, low-cost safety net or backup plan",
                  "uncertainty": "low | medium | high"
                }
              ],
              "perspectives": [
                {
                  "viewpoint": "e.g. Your Tomorrow-Morning Self / A Cautious Teammate / A Close Friend / A Practical Outsider",
                  "reasoning": "How they would see this situation and what advice they would give"
                }
              ],
              "questions": [
                {
                  "question": "A thought-provoking, simple question that forces honest trade-offs",
                  "purpose": "What this question helps clarify"
                }
              ],
              "evidenceGaps": [
                {
                  "unknown": "A key missing piece of information that would make the choice much easier",
                  "importance": "Why knowing this before deciding will save headaches",
                  "verification": "A quick, realistic way to check or find this out"
                }
              ],
              "reflectionPrompt": "What looks different to you now about this choice?"
            }

            Include 3-4 assumptions, 3-4 blindSpots, 3-4 risks, 3-4 perspectives, 4-5 questions, and 3-4 evidenceGaps. Keep each entry focused, clear, and high-impact.
            """,
                truncate(decision, 500),
                truncate(context, 1000),
                toJsonArrayString(options),
                truncate(priorities, 500),
                truncate(currentThinking, 500)
        );

        String rawJson = callGeminiWithFallback(prompt, systemInstruction);
        return parseJson(rawJson, BlindSpotAnalysisDto.class);
    }

    /**
     * Screen D: Challenge My Thinking Counterargument
     */
    public ChallengeResponseDto generateChallengeThinking(ChallengeRequestDto input) {
        String decision = input.decision() != null ? input.decision().trim() : "";
        if (decision.length() < 5) {
            throw new IllegalArgumentException("Decision context is required to challenge thinking.");
        }

        String systemInstruction = """
            You are a friendly, constructive critic helping stress-test a proposed idea or decision.
            Your job is to poke holes in the idea constructively and clearly so the user can make it much stronger before committing.

            WRITING STYLE & TONE GUIDELINES:
            1. Write in simple, clear, conversational English. Avoid jargon or intimidating words.
            2. Be helpful, constructive, and friendly—not discouraging or cynical.
            3. Give tangible, realistic examples of what could go wrong or how things could be interpreted differently.
            4. Return strictly valid JSON.
            """;

        String prompt = String.format("""
            Stress-test this decision and construct a clear, friendly counterargument written in simple, everyday language.

            DECISION: "%s"
            CONTEXT: "%s"
            OPTIONS: %s
            CURRENT THINKING: "%s"
            SUMMARY OF PREVIOUS ANALYSIS: "%s"

            Return a JSON object with this exact structure:
            {
              "counterargument": "The single strongest, most compelling counterpoint against the user's current leaning, explained in simple words.",
              "vulnerableAssumption": "The weakest link or assumption that, if wrong, causes this entire strategy to fail.",
              "alternativeInterpretation": "A completely different, equally realistic way to look at the same situation.",
              "secondOrderConsequence": "An unexpected domino effect or headache that could pop up 6-12 months down the line.",
              "challengingQuestions": [
                "A direct, thoughtful question challenging the core logic",
                "What would happen if you chose the exact opposite path?"
              ],
              "evidenceConsiderations": {
                "strengthens": "What real-world sign or metric would support this counterargument?",
                "weakens": "What evidence would prove this counterargument wrong and reassure you?"
              }
            }
            """,
                truncate(decision, 500),
                truncate(input.context(), 800),
                toJsonArrayString(input.options()),
                truncate(input.currentThinking() != null ? input.currentThinking() : "The user prefers their primary option", 500),
                truncate(input.analysisSummary(), 500)
        );

        String rawJson = callGeminiWithFallback(prompt, systemInstruction);
        return parseJson(rawJson, ChallengeResponseDto.class);
    }

    /**
     * Screen E: Run a Pre-Mortem Scenario
     */
    public PremortemResponseDto generatePremortem(PremortemRequestDto input) {
        String decision = input.decision() != null ? input.decision().trim() : "";
        if (decision.length() < 5) {
            throw new IllegalArgumentException("Decision context is required to run a pre-mortem.");
        }

        String timeHorizon = input.timeHorizon() != null && !input.timeHorizon().isBlank() ? input.timeHorizon() : "12 months";
        String chosenOption = input.chosenOption() != null && !input.chosenOption().isBlank() ? input.chosenOption() : "The proposed strategy";

        String systemInstruction = String.format("""
            You are a practical scenario advisor helping someone stress-test a decision by imagining what could go wrong before they commit.
            Imagine it is now %s in the future, and this decision unexpectedly ran into big trouble.
            Help the user understand what went wrong, what early warning signs were ignored, and what simple steps they can take today to protect themselves.

            WRITING STYLE & TONE GUIDELINES:
            1. Use clear, simple, conversational English. No corporate buzzwords or academic jargon.
            2. Tell a realistic, relatable story of how things fell behind or hit obstacles.
            3. Make preventive steps easy and realistic to put into practice.
            4. Return strictly valid JSON.
            """, timeHorizon);

        String prompt = String.format("""
            Perform a realistic future risk simulation on this decision. Write in simple, clear everyday language.

            DECISION: "%s"
            CONTEXT: "%s"
            OPTION EXAMINED: "%s"
            TIME HORIZON: "%s"

            Return a JSON object with this exact structure:
            {
              "failureScenario": "A realistic, straightforward story describing how this decision ran into trouble over the next %s.",
              "plausibleContributingFactors": [
                "Main cause 1: e.g. Took twice as long or was harder than expected",
                "Main cause 2: e.g. Key people or customers were not on board",
                "Main cause 3: e.g. Unforeseen costs or complexity ate up resources"
              ],
              "earlyWarningSigns": [
                "An early clue in Month 1-2 that trouble was brewing",
                "A warning sign in Month 3-4 that things were drifting off track"
              ],
              "preventiveQuestions": [
                "What simple question should we ask every week to catch this early?",
                "What red flag should make us pause immediately?"
              ],
              "riskReductionActions": [
                "A low-cost, low-risk test to run before making the full commitment",
                "A simple backup plan or hedge in case things stall"
              ]
            }
            """,
                truncate(decision, 500),
                truncate(input.context(), 800),
                truncate(chosenOption, 250),
                timeHorizon,
                timeHorizon
        );

        String rawJson = callGeminiWithFallback(prompt, systemInstruction);
        return parseJson(rawJson, PremortemResponseDto.class);
    }

    private <T> T parseJson(String raw, Class<T> clazz) {
        try {
            String cleaned = cleanJsonText(raw);
            return objectMapper.readValue(cleaned, clazz);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini JSON output: " + e.getMessage(), e);
        }
    }

    private String truncate(String val, int maxLen) {
        if (val == null) return "";
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }

    private String toJsonArrayString(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        try {
            List<String> truncated = new ArrayList<>();
            for (String s : list) {
                if (s != null) truncated.add(truncate(s, 200));
            }
            return objectMapper.writeValueAsString(truncated);
        } catch (Exception e) {
            return "[]";
        }
    }
}
