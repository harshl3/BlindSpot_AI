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
            1. WRITE AT A 6TH-GRADE READING LEVEL:
               - Speak in plain, everyday conversational English like a thoughtful friend over coffee.
               - Keep sentences short, crisp, and punchy.
               - STRICTLY FORBIDDEN JARGON: Do NOT use phrases like "execution velocity", "cognitive impairment",
                 "error-compounding", "utility", "forgo", "falsify", "heuristics", "salience", "epistemic",
                 "catastrophic judgment failure", "substantive delta", "operational friction", "unexamined dependency",
                 or "mitigation paradigm".
               - Use natural, friendly words: "getting tired", "making silly mistakes", "running out of time", "burnout",
                 "staying focused", "fixing errors later", "peace of mind", "backup plan".

            2. STRICT BREVITY & ZERO FLUFF (NO WALLS OF TEXT):
               - Users DO NOT want to read long essays. Keep every item bite-sized and skimmable.
               - Statements, risks, and factors must be ONE SHORT SENTENCE (under 15 words).
               - Explanations and reasons must be ONE or TWO SHORT SENTENCES (under 25 words total).

            3. MATCH THE SCOPE OF THE QUESTION NATURALLY:
               - If the user asks a personal or lifestyle question (e.g., "sleep or not sleep", "cook at home or order food", "take a break"), respond with common sense, everyday relatable consequences. Never make everyday habits sound like a corporate boardroom crisis.
               - If the user asks a business or technical question, keep it grounded, realistic, and jargon-free.

            4. NEVER INVENT FAKE CORPORATE PRIORITIES:
               - If the user entered simple or empty priorities, summarize what they actually asked in 1 simple sentence. Never hallucinate complex consultant phrases.

            5. Return strictly valid JSON adhering to the required schema.
            """;

        String prompt = String.format("""
            Analyze this decision and return a short, punchy, easy-to-read JSON report in simple everyday language.

            DECISION: "%s"
            CONTEXT: "%s"
            OPTIONS: %s
            PRIORITIES / WHAT MATTERS MOST: "%s"
            CURRENT THINKING / BELIEF: "%s"

            Return a JSON object with EXACTLY this structure:
            {
              "decisionSummary": "A clear, natural 1-sentence overview of the dilemma using everyday words.",
              "assumptions": [
                {
                  "statement": "A short, plain-English guess the user might be taking for granted (max 15 words)",
                  "whyItMatters": "Why this matters if wrong in 1-2 simple sentences (max 25 words)",
                  "question": "A simple, friendly question to test this assumption",
                  "confidence": "low | medium | high"
                }
              ],
              "blindSpots": [
                {
                  "factor": "An overlooked factor or surprise that could pop up (max 15 words)",
                  "impact": "How this could create headaches in 1-2 simple sentences (max 25 words)",
                  "nextStep": "A simple, concrete thing to verify right away (max 15 words)"
                }
              ],
              "risks": [
                {
                  "risk": "A realistic risk or trade-off in simple words (max 15 words)",
                  "reason": "Why this could happen in 1-2 simple sentences (max 25 words)",
                  "warningSign": "An early red flag that things are going sideways (max 15 words)",
                  "mitigation": "A practical, simple backup plan (max 15 words)",
                  "uncertainty": "low | medium | high"
                }
              ],
              "perspectives": [
                {
                  "viewpoint": "e.g. Your Tomorrow-Morning Self / A Close Friend / A Practical Outsider",
                  "reasoning": "How they see this in 1-2 simple sentences"
                }
              ],
              "questions": [
                {
                  "question": "A short, thoughtful question that forces an honest trade-off",
                  "purpose": "What this question clarifies in 1 simple sentence"
                }
              ],
              "evidenceGaps": [
                {
                  "unknown": "A missing piece of info that would make the choice easy (max 15 words)",
                  "importance": "Why knowing this saves trouble (max 20 words)",
                  "verification": "A quick, realistic way to check this (max 15 words)"
                }
              ],
              "reflectionPrompt": "A single friendly, thought-provoking question to help the user wrap up their thoughts."
            }

            COUNT LIMITS:
            - Provide exactly 2 (at most 3) assumptions, 2-3 blind spots, 2-3 risks, 2 perspectives, 3 questions, and 2 evidence gaps.
            - Quality and clarity over quantity. Keep everything short, punchy, and easy to read in 60 seconds!
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
            Your job is to poke holes in the idea constructively, kindly, and clearly so the user can make it much stronger before committing.

            WRITING STYLE & TONE GUIDELINES:
            1. Write in plain, everyday conversational English (6th-grade reading level). No corporate or academic jargon.
            2. Be encouraging and helpful—like a wise friend, not a cynical interrogator.
            3. STRICT BREVITY: Keep all explanations under 2 short sentences. No essays or rambling paragraphs.
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
              "counterargument": "The single strongest, most compelling counterpoint against the user's current leaning, explained in 2 short, simple sentences (max 35 words).",
              "vulnerableAssumption": "The weakest guess or assumption that, if wrong, causes problems (1 short sentence, max 20 words).",
              "alternativeInterpretation": "A different, practical way to look at the same situation (1-2 short sentences, max 25 words).",
              "secondOrderConsequence": "An unexpected headache that could pop up down the line (1-2 short sentences, max 25 words).",
              "challengingQuestions": [
                "A direct, thoughtful question challenging the core logic",
                "What would happen if you chose the exact opposite path?"
              ],
              "evidenceConsiderations": {
                "strengthens": "What real-world sign would prove this concern right? (1 sentence)",
                "weakens": "What evidence would reassure you that everything is fine? (1 sentence)"
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
            You are a practical, friendly advisor helping someone stress-test a decision by imagining what could go wrong before they commit.
            Imagine it is now %s in the future, and this decision unexpectedly ran into trouble.
            Help the user understand what went wrong, what early warning signs were missed, and what simple steps they can take today to protect themselves.

            WRITING STYLE & TONE GUIDELINES:
            1. Use simple, everyday conversational English (6th-grade reading level). No corporate buzzwords or academic jargon.
            2. Tell a realistic, relatable story in 2-3 short, clear sentences.
            3. Make preventive steps easy and realistic to put into practice.
            4. Keep all bullets short (1 sentence each).
            5. Return strictly valid JSON.
            """, timeHorizon);

        String prompt = String.format("""
            Perform a realistic future risk simulation on this decision. Write in simple, clear everyday language.

            DECISION: "%s"
            CONTEXT: "%s"
            OPTION EXAMINED: "%s"
            TIME HORIZON: "%s"

            Return a JSON object with this exact structure:
            {
              "failureScenario": "A realistic, straightforward story in 2-3 short sentences describing how this decision ran into trouble over the next %s (max 45 words).",
              "plausibleContributingFactors": [
                "Main cause 1: e.g. Took twice as long or was harder than expected (max 15 words)",
                "Main cause 2: e.g. Key people were not on board (max 15 words)"
              ],
              "earlyWarningSigns": [
                "An early red flag that things are drifting off track (max 15 words)",
                "A second warning sign to watch out for (max 15 words)"
              ],
              "preventiveQuestions": [
                "A simple question to ask regularly to catch this early (max 15 words)"
              ],
              "riskReductionActions": [
                "A low-cost, low-risk test to run before committing (max 15 words)",
                "A simple backup plan in case things stall (max 15 words)"
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
