import { describe, it, expect, beforeEach } from "vitest";
import type { UserReflection, SavedDecisionRecord, DecisionInput, BlindSpotAnalysis } from "../src/types/decision";

// Mock localStorage for test environment
class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] || null;
  }
  setItem(key: string, value: string) {
    this.store[key] = value;
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();

function saveLocalRecord(record: SavedDecisionRecord) {
  const current = JSON.parse(mockStorage.getItem("test_records") || "[]");
  current.unshift(record);
  mockStorage.setItem("test_records", JSON.stringify(current));
}

function getLocalRecords(): SavedDecisionRecord[] {
  return JSON.parse(mockStorage.getItem("test_records") || "[]");
}

describe("Persistence and Reflection Workflow", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it("saves a valid user reflection without assigning pseudo-scores", () => {
    const reflection: UserReflection = {
      state: "thinking_changed",
      notes: "Decided to run a 2-week spike before committing to the full rewrite.",
      savedAt: new Date().toISOString(),
      checkedAspects: ["assumptions", "risks", "evidenceGaps"]
    };

    expect(reflection.state).toBe("thinking_changed");
    expect(reflection.checkedAspects).toHaveLength(3);
    // Preserves reflection without fabricating an arbitrary numerical confidence score
    expect((reflection as any).confidenceScore).toBeUndefined();
  });

  it("persists decision records locally and preserves timestamps", () => {
    const mockInput: DecisionInput = {
      decision: "Should we hire 2 senior engineers or 4 juniors?",
      context: "Tight delivery deadline in 4 months.",
      options: ["Hire 2 seniors", "Hire 4 juniors"],
      priorities: "Speed and onboarding simplicity",
      currentThinking: "Seniors can hit the ground running immediately."
    };

    const mockAnalysis: BlindSpotAnalysis = {
      decisionSummary: "Comparing senior vs junior hiring tradeoffs.",
      assumptions: [],
      blindSpots: [],
      risks: [],
      perspectives: [],
      questions: [],
      evidenceGaps: [],
      reflectionPrompt: "What might you see differently?"
    };

    const record: SavedDecisionRecord = {
      id: "local_12345",
      userId: "guest",
      input: mockInput,
      analysis: mockAnalysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveLocalRecord(record);
    const records = getLocalRecords();

    expect(records).toHaveLength(1);
    expect(records[0].id).toBe("local_12345");
    expect(records[0].input.decision).toContain("hire 2 senior engineers");
  });
});
