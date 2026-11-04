import {
  generateBlindSpotAnalysis,
  generateChallengeThinking,
  generatePremortem
} from "../../server/geminiService.js";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

export const handler = async (event) => {
  // Support preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  // Parse path
  const rawPath = event.path || "";
  const subPath = rawPath
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "")
    .replace(/\/$/, "");

  try {
    // Health check
    if (subPath === "/health" || subPath === "") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          status: "ok",
          service: "BlindSpot Netlify Function",
          geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
        })
      };
    }

    // POST /api/analyze
    if (event.httpMethod === "POST" && (subPath === "/analyze" || subPath.endsWith("/analyze"))) {
      const body = JSON.parse(event.body || "{}");
      const result = await generateBlindSpotAnalysis(body);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(result)
      };
    }

    // POST /api/challenge
    if (event.httpMethod === "POST" && (subPath === "/challenge" || subPath.endsWith("/challenge"))) {
      const body = JSON.parse(event.body || "{}");
      const result = await generateChallengeThinking(body);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(result)
      };
    }

    // POST /api/premortem
    if (event.httpMethod === "POST" && (subPath === "/premortem" || subPath.endsWith("/premortem"))) {
      const body = JSON.parse(event.body || "{}");
      const result = await generatePremortem(body);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Not found: ${subPath}` })
    };
  } catch (err) {
    console.error("[Netlify Function Error]", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: err.message || "Failed to process request with Gemini API."
      })
    };
  }
};
