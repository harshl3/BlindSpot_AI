import { describe, it, expect } from "vitest";

// Parsing helper matching server/geminiService.js
function parseCleanJson(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
  }
  return JSON.parse(cleaned);
}

function validateAnalysisSchema(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (typeof data.decisionSummary !== "string") return false;
  if (!Array.isArray(data.assumptions)) return false;
  if (!Array.isArray(data.blindSpots)) return false;
  if (!Array.isArray(data.risks)) return false;
  if (!Array.isArray(data.perspectives)) return false;
  if (!Array.isArray(data.questions)) return false;
  if (!Array.isArray(data.evidenceGaps)) return false;
  return true;
}

describe("AI Response Parsing and Schema Validation", () => {
  it("parses clean JSON string correctly", () => {
    const raw = JSON.stringify({
      decisionSummary: "User is evaluating rewrite vs refactor.",
      assumptions: [{ statement: "Go will solve all issues", whyItMatters: "High risk", question: "Is CPU the bottleneck?", confidence: "high" }],
      blindSpots: [{ factor: "Team unfamiliar with Go", impact: "Slow velocity", nextStep: "Run pilot" }],
      risks: [{ risk: "6-month feature freeze", reason: "Migration overhead", warningSign: "Missed sprints", mitigation: "Dual-write" }],
      perspectives: [{ viewpoint: "Risk Auditor", reasoning: "Too risky" }],
      questions: [{ question: "What is current p99?", purpose: "Establish baseline" }],
      evidenceGaps: [{ unknown: "DB lock times", importance: "Vital", verification: "Run APM trace" }],
      reflectionPrompt: "What might you see differently?"
    });

    const parsed = parseCleanJson(raw);
    expect(parsed.decisionSummary).toContain("rewrite vs refactor");
    expect(validateAnalysisSchema(parsed)).toBe(true);
  });

  it("cleans markdown ```json code blocks before parsing", () => {
    const raw = "```json\n" + JSON.stringify({
      decisionSummary: "Summary",
      assumptions: [],
      blindSpots: [],
      risks: [],
      perspectives: [],
      questions: [],
      evidenceGaps: [],
      reflectionPrompt: "Reflect"
    }) + "\n```";

    const parsed = parseCleanJson(raw);
    expect(parsed.decisionSummary).toBe("Summary");
    expect(validateAnalysisSchema(parsed)).toBe(true);
  });

  it("detects malformed schemas missing required array fields", () => {
    const badData = {
      decisionSummary: "Only a summary, no assumptions",
      // missing assumptions, blindSpots, etc.
    };

    expect(validateAnalysisSchema(badData)).toBe(false);
  });

  it("handles empty input or non-JSON cleanly with error", () => {
    expect(() => parseCleanJson("Invalid non-json output from AI")).toThrow();
  });
});
