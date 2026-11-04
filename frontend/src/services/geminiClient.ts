/**
 * Gemini Client - Server-Side Isolated
 * 
 * Note: To prevent API key leakage and maintain production security,
 * all Gemini AI reasoning calls are now securely executed via the
 * Spring Boot backend (/api/analyze, /api/challenge, /api/premortem).
 * Direct browser-side API calls have been intentionally removed.
 */

import type {
  DecisionInput,
  BlindSpotAnalysis,
  ChallengeResponse,
  PremortemResponse
} from "../types/decision";

export async function analyzeDecisionClient(_input: DecisionInput): Promise<BlindSpotAnalysis> {
  throw new Error("Direct client Gemini calls are disabled for security. Please ensure the Spring Boot backend is running.");
}

export async function challengeThinkingClient(_payload: {
  decision: string;
  context: string;
  options: string[];
  currentThinking: string;
  analysisSummary: string;
}): Promise<ChallengeResponse> {
  throw new Error("Direct client Gemini calls are disabled for security. Please ensure the Spring Boot backend is running.");
}

export async function runPremortemClient(_payload: {
  decision: string;
  context: string;
  chosenOption: string;
  timeHorizon?: string;
}): Promise<PremortemResponse> {
  throw new Error("Direct client Gemini calls are disabled for security. Please ensure the Spring Boot backend is running.");
}
