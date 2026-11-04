import { describe, it, expect } from "vitest";

function validateDecisionInput(input: {
  decision?: string;
  context?: string;
  options?: string[];
  priorities?: string;
  currentThinking?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.decision || !input.decision.trim()) {
    errors.decision = "Decision is required.";
  } else if (input.decision.trim().length < 8) {
    errors.decision = "Decision statement must be at least 8 characters.";
  }

  const validOptions = (input.options || []).map((o) => o.trim()).filter(Boolean);
  if (validOptions.length < 2) {
    errors.options = "At least two distinct options must be provided.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

describe("Decision Form Validation Logic", () => {
  it("rejects empty decision statement", () => {
    const res = validateDecisionInput({
      decision: "",
      options: ["Option A", "Option B"]
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.decision).toBeDefined();
  });

  it("rejects too short decision statement (< 8 chars)", () => {
    const res = validateDecisionInput({
      decision: "Quit?",
      options: ["Option A", "Option B"]
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.decision).toContain("at least 8 characters");
  });

  it("rejects fewer than two options", () => {
    const res = validateDecisionInput({
      decision: "Should we rewrite the monolith?",
      options: ["Option A only"]
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.options).toBeDefined();
  });

  it("rejects options with only whitespace", () => {
    const res = validateDecisionInput({
      decision: "Should we rewrite the monolith?",
      options: ["Option A", "   ", ""]
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.options).toContain("At least two distinct options");
  });

  it("accepts valid decision input with two or more options", () => {
    const res = validateDecisionInput({
      decision: "Should we expand to Europe or double down on US market?",
      options: ["Expand to Europe in Q3", "Double down on US domestic enterprise sales"],
      priorities: "Preserve 18-month runway",
      currentThinking: "Europe expansion opens greenfield TAM."
    });
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });
});
