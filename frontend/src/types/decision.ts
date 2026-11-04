export interface DecisionInput {
  decision: string;
  context: string;
  options: string[];
  priorities: string;
  currentThinking: string;
}

export interface AssumptionItem {
  statement: string;
  whyItMatters: string;
  question: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface BlindSpotItem {
  factor: string;
  impact: string;
  nextStep: string;
}

export interface RiskItem {
  risk: string;
  reason: string;
  warningSign: string;
  mitigation: string;
  uncertainty?: 'low' | 'medium' | 'high';
}

export interface PerspectiveItem {
  viewpoint: string;
  reasoning: string;
}

export interface QuestionItem {
  question: string;
  purpose: string;
}

export interface EvidenceGapItem {
  unknown: string;
  importance: string;
  verification: string;
}

export interface BlindSpotAnalysis {
  decisionSummary: string;
  assumptions: AssumptionItem[];
  blindSpots: BlindSpotItem[];
  risks: RiskItem[];
  perspectives: PerspectiveItem[];
  questions: QuestionItem[];
  evidenceGaps: EvidenceGapItem[];
  reflectionPrompt: string;
}

export interface ChallengeResponse {
  counterargument: string;
  vulnerableAssumption: string;
  alternativeInterpretation: string;
  secondOrderConsequence: string;
  challengingQuestions: string[];
  evidenceConsiderations: {
    strengthens: string;
    weakens: string;
  };
}

export interface PremortemResponse {
  failureScenario: string;
  plausibleContributingFactors: string[];
  earlyWarningSigns: string[];
  preventiveQuestions: string[];
  riskReductionActions: string[];
}

export type ReflectionState = 
  | 'thinking_changed'
  | 'thinking_strengthened'
  | 'need_more_info'
  | 'still_uncertain';

export interface UserReflection {
  state: ReflectionState;
  notes: string;
  savedAt: string;
  checkedAspects: string[];
}

export interface SavedDecisionRecord {
  id: string;
  userId?: string;
  input: DecisionInput;
  analysis: BlindSpotAnalysis;
  challengeResult?: ChallengeResponse | null;
  premortemResult?: PremortemResponse | null;
  reflection?: UserReflection | null;
  createdAt: string;
  updatedAt: string;
}
