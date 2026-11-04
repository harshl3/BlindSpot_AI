import type {
  DecisionInput,
  BlindSpotAnalysis,
  ChallengeResponse,
  PremortemResponse,
  SavedDecisionRecord
} from "../types/decision";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Safely parse JSON from Response
 */
async function safeParseJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    const text = await response.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Submit decision to Gemini for full 8-section analysis via Spring Boot.
 */
export async function analyzeDecision(input: DecisionInput): Promise<BlindSpotAnalysis> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const errData = await safeParseJson<{ error?: string }>(response);
    throw new ApiError(errData?.error || `Analysis request failed with status ${response.status}`, response.status);
  }

  const data = await safeParseJson<BlindSpotAnalysis>(response);
  if (!data || !data.decisionSummary) {
    throw new ApiError("Received invalid analysis report format from backend.");
  }
  return data;
}

/**
 * Request Gemini Devil's Advocate counterargument via Spring Boot.
 */
export async function challengeThinking(payload: {
  decision: string;
  context: string;
  options: string[];
  currentThinking: string;
  analysisSummary: string;
}): Promise<ChallengeResponse> {
  const response = await fetch(`${API_BASE}/api/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await safeParseJson<{ error?: string }>(response);
    throw new ApiError(errData?.error || `Challenge request failed with status ${response.status}`, response.status);
  }

  const data = await safeParseJson<ChallengeResponse>(response);
  if (!data || !data.counterargument) {
    throw new ApiError("Received invalid challenge response format from backend.");
  }
  return data;
}

/**
 * Request Gemini backward-reasoning Pre-Mortem analysis via Spring Boot.
 */
export async function runPremortem(payload: {
  decision: string;
  context: string;
  chosenOption: string;
  timeHorizon?: string;
}): Promise<PremortemResponse> {
  const response = await fetch(`${API_BASE}/api/premortem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await safeParseJson<{ error?: string }>(response);
    throw new ApiError(errData?.error || `Pre-mortem request failed with status ${response.status}`, response.status);
  }

  const data = await safeParseJson<PremortemResponse>(response);
  if (!data || !data.failureScenario) {
    throw new ApiError("Received invalid pre-mortem response format from backend.");
  }
  return data;
}

/**
 * Check backend health
 */
export async function checkApiHealth(): Promise<{
  status: string;
  service?: string;
  geminiConfigured: boolean;
  databaseConnected?: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) {
      const data = await safeParseJson<{
        status: string;
        service?: string;
        geminiConfigured: boolean;
        databaseConnected?: boolean;
      }>(res);
      if (data) return data;
    }
  } catch {
    // Backend offline
  }
  return { status: "offline", geminiConfigured: false, databaseConnected: false };
}

/**
 * Save decision record directly to Spring Boot + MongoDB Atlas backend
 */
export async function saveDecisionToBackend(
  record: Omit<SavedDecisionRecord, "id" | "createdAt" | "updatedAt"> & { id?: string },
  idToken?: string,
  guestSessionId?: string
): Promise<{ record: SavedDecisionRecord; storageType: string; message: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }
  if (guestSessionId) {
    headers["X-Guest-Session-Id"] = guestSessionId;
  }

  const response = await fetch(`${API_BASE}/api/decisions`, {
    method: "POST",
    headers,
    body: JSON.stringify(record)
  });

  if (!response.ok) {
    const errData = await safeParseJson<{ error?: string }>(response);
    throw new ApiError(errData?.error || `Failed to save decision: HTTP ${response.status}`, response.status);
  }

  const data = await response.json();
  return data;
}

/**
 * Load decisions from Spring Boot + MongoDB Atlas backend
 */
export async function fetchDecisionsFromBackend(
  idToken?: string,
  guestSessionId?: string
): Promise<SavedDecisionRecord[]> {
  const headers: Record<string, string> = {};
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }
  if (guestSessionId) {
    headers["X-Guest-Session-Id"] = guestSessionId;
  }

  const response = await fetch(`${API_BASE}/api/decisions`, {
    method: "GET",
    headers
  });

  if (!response.ok) {
    throw new ApiError(`Failed to fetch decisions: HTTP ${response.status}`, response.status);
  }

  const list = await response.json();
  return Array.isArray(list) ? list : [];
}

/**
 * Delete decision from Spring Boot + MongoDB Atlas backend
 */
export async function deleteDecisionFromBackend(
  id: string,
  idToken?: string,
  guestSessionId?: string
): Promise<void> {
  const headers: Record<string, string> = {};
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }
  if (guestSessionId) {
    headers["X-Guest-Session-Id"] = guestSessionId;
  }

  const response = await fetch(`${API_BASE}/api/decisions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers
  });

  if (!response.ok && response.status !== 404) {
    throw new ApiError(`Failed to delete decision: HTTP ${response.status}`, response.status);
  }
}

/**
 * Check MongoDB Atlas database connection health
 */
export async function checkMongoDbHealth(): Promise<{
  connected: boolean;
  message: string;
  count: number;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/decisions/db-health`);
    if (response.ok) {
      const data = await response.json();
      return {
        connected: Boolean(data.connected),
        message: data.message || "MongoDB Atlas is reachable",
        count: Number(data.count || 0)
      };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return { connected: false, message: `MongoDB Atlas ping error: ${msg}`, count: 0 };
  }
  return { connected: false, message: "MongoDB Atlas ping endpoint returned non-200", count: 0 };
}
