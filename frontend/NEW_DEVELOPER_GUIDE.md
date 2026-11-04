# BlindSpot AI — Developer Guide & System Architecture

BlindSpot is an AI-powered cognitive reasoning partner designed to help professionals, engineering leaders, and decision-makers uncover hidden assumptions, spot overlooked risks, simulate failure modes, and stress-test strategic choices before committing.

---

## 1. System Architecture Overview

BlindSpot follows a decoupled, production-grade architecture combining a responsive React 19 Single Page Application with a Spring Boot 3.4 (Java 21) REST backend, Google Gemini AI cognitive engines, MongoDB Atlas document persistence, and Firebase Authentication.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 + TypeScript Frontend                  │
│                     (Vite 8, Tailwind v4, Lucide Icons)                │
└───────────────┬────────────────────────────┬───────────────────────────┘
                │                            │
      Google Sign-In / ID Tokens             │ REST API Calls (/api/*)
                ▼                            ▼
┌──────────────────────────────┐ ┌───────────────────────────────────────┐
│     Firebase Authentication  │ │      Spring Boot 3.4 (Java 21)        │
│   (Google & Anonymous Auth)  │ │         REST API & Security           │
└──────────────────────────────┘ └───────┬───────────────────────┬───────┘
                                         │                       │
                       JSON Schema Prompts & Fallback    BSON Document Mapping
                                         ▼                       ▼
                         ┌───────────────────────┐ ┌─────────────────────┐
                         │   Google Gemini API   │ │    MongoDB Atlas    │
                         │ (gemini-3.8-flash /   │ │   (blindspot_db     │
                         │  gemini-3.5-flash)    │ │    decisions col)   │
                         └───────────────────────┘ └─────────────────────┘
```

### Component Stack
- **Frontend**: React 19, TypeScript ~6.0, TailwindCSS v4, Vite 8, Lucide React, Canvas Confetti.
- **Backend**: Java 21, Spring Boot 3.4.2, Maven, Spring Web, Spring Data MongoDB, Jakarta Validation, Auth0 JWKS-RSA.
- **Database**: MongoDB Atlas (`cluster0.qmxfmkj.mongodb.net`, database: `blindspot_db`, collection: `decisions`).
- **AI Engine**: Google Gemini API via server-side `RestClient` with multi-model cascading fallback.
- **Authentication**: Firebase Authentication with cryptographic JWT verification in Spring Boot.

---

## 2. Core Features & Cognitive Workflows

### Workflow 1: Multi-Stage Decision Framing
- **Route**: `Navbar` -> `Workspace`
- Users define:
  1. **Decision Statement**: Must be $\ge 5$ characters.
  2. **Context**: Background facts, constraints, and organizational dynamics.
  3. **Options**: At least 2 distinct alternatives to evaluate.
  4. **Priorities**: What matters most (e.g. runway, velocity, retention).
  5. **Current Thinking**: Stated hypothesis or preliminary leaning.
- **Guardrails**: Input validation prevents empty or single-option submissions.

### Workflow 2: 8-Section BlindSpot Analysis
Submitting the decision workspace calls `POST /api/analyze`, generating an 8-section structured report:
1. **Decision Snapshot**: Objective 2–3 sentence synopsis of the dilemma and stated priorities.
2. **Hidden Assumptions**: Unstated hypotheses treated as fact, their impact, confidence level (`low`, `medium`, `high`), and probing questions.
3. **Potential Blind Spots**: Overlooked variables, silent derailers, and concrete verification steps.
4. **Potential Risks & Failure Modes**: Second-order consequences, early warning signs, and mitigations.
5. **Alternative Perspectives**: Counter-evaluations from diverse personas (e.g. Risk Auditor, 5-Year Stakeholder, Frontline User).
6. **Questions Worth Asking**: High-leverage questions exposing conflicting priorities.
7. **Evidence Gaps (Mind Changers)**: Crucial unknowns that could swing the choice, plus methods to verify them.
8. **Reflection Prompt**: Open cognitive inquiry to reframe perspective.

### Workflow 3: Interactive 5-Axis Cognitive Radar Graph
An SVG visualizer dynamically evaluates the decision's cognitive footprint across 5 axes:
- **Assumption Fragility** (%): Vulnerability if underlying hypotheses fail.
- **Downside Exposure** (%): Concentration of operational risks and severity.
- **Irreversibility** (%): Assessment of one-way vs. two-way door decisions.
- **Evidence Solidity** (%): Presence vs. absence of verification steps.
- **Perspective Breadth** (%): Diversity of stakeholder viewpoints considered.

### Workflow 4: Devil's Advocate / Challenge Thinking
- **Trigger**: Click **"Challenge My Thinking"** or navigate to **Thinking Lab**.
- **Endpoint**: `POST /api/challenge`
- **Output**:
  - Compelling counterargument against the user's leaning.
  - Fragile premise that causes the strategy to unravel.
  - Alternative interpretations of identical facts.
  - 6–18 month second-order consequences.
  - Challenging questions and observable evidence considerations.

### Workflow 5: Pre-Mortem Scenario Simulator
- **Trigger**: Click **"Run Pre-Mortem"** or navigate to **Thinking Lab**.
- **Endpoint**: `POST /api/premortem`
- **Time Horizons**: 3, 6, 12, or 24 months.
- **Output**:
  - Hypothetical failure narrative reasoning backward from a future collapse.
  - Plausible contributing root causes.
  - Early warning signs (Month 1–2, Month 3–4).
  - Monday morning preventive questions and circuit-breakers.
  - Low-cost risk-reduction actions and dual-track hedges.

### Workflow 6: Structured Reflection & Persistence
- **State Selection**: Users capture their post-analysis state:
  - `thinking_changed`: Analysis exposed blind spots that changed direction.
  - `thinking_strengthened`: Counterarguments validated and clarified priorities.
  - `need_more_info`: Significant evidence gaps require investigation.
  - `still_uncertain`: Genuine trade-offs require testing or incubation.
- **Action**: Confirms examined aspects, notes rationale, and triggers celebratory confetti upon saving to MongoDB Atlas.

### Workflow 7: Decision History & Storage
- **Modal**: `DecisionHistoryModal` accessible via top navigation.
- **Features**:
  - Full-text search across decision titles, contexts, and reflection notes.
  - Reload past analysis reports directly back into the active workspace.
  - Delete past decision records with user ownership checks.
  - Live Database Connection Tester checking MongoDB Atlas health and active record count.

---

## 3. Backend REST API Specifications

Base URL: `http://localhost:8080/api` (proxied via Vite at `/api` during development)

### `GET /api/health`
Health check verifying Spring Boot status, MongoDB Atlas connectivity, and Gemini key availability.
- **Response**:
```json
{
  "status": "ok",
  "service": "BlindSpot Spring Boot 3.4 API (Java 21)",
  "geminiConfigured": true,
  "databaseConnected": true,
  "timestamp": "2026-10-28T01:15:50Z"
}
```

### `POST /api/analyze`
Generates the complete 8-section cognitive analysis.
- **Request Body**:
```json
{
  "decision": "Should we hire 2 senior engineers or 4 juniors?",
  "context": "Tight delivery deadline in 4 months.",
  "options": ["Hire 2 seniors", "Hire 4 juniors"],
  "priorities": "Speed and onboarding simplicity",
  "currentThinking": "Seniors can hit the ground running immediately."
}
```
- **Response**: `BlindSpotAnalysisDto` (JSON adhering to the 8-section schema).

### `POST /api/challenge`
Devil's Advocate cognitive stress-test.
- **Request Body**:
```json
{
  "decision": "Mandate full return-to-office 5 days a week",
  "context": "Engineering team",
  "options": ["Mandate 5 days", "Stay hybrid"],
  "currentThinking": "In-person presence naturally creates breakthroughs.",
  "analysisSummary": "Prioritizing synchronous collaboration."
}
```
- **Response**: `ChallengeResponseDto`.

### `POST /api/premortem`
Backward-reasoning failure scenario simulator.
- **Request Body**:
```json
{
  "decision": "Launch an autonomous customer reply AI bot",
  "context": "Customer helpdesk",
  "chosenOption": "Roll out to 100% of users immediately",
  "timeHorizon": "6 months"
}
```
- **Response**: `PremortemResponseDto`.

### `GET /api/decisions`
Retrieves saved decisions scoped to the authenticated user.
- **Headers**:
  - `Authorization: Bearer <firebaseIdToken>` (or `X-Guest-Session-Id: <id>`)
- **Response**: `List<SavedDecisionRecordDto>` sorted by creation date descending.

### `POST /api/decisions`
Saves or updates a decision record in MongoDB Atlas.
- **Headers**:
  - `Authorization: Bearer <firebaseIdToken>` (or `X-Guest-Session-Id: <id>`)
- **Response (201 Created)**:
```json
{
  "storageType": "mongodb",
  "record": {
    "id": "6ae0ffa86cb27b7dc4924ecf",
    "userId": "user_123",
    "createdAt": "2026-10-28T01:16:48Z", ...
  },
  "message": "Successfully stored in MongoDB Atlas (Doc ID: 6ae0ffa86cb27b7dc4924ecf)!"
}
```

### `DELETE /api/decisions/{id}`
Deletes a decision record if owned by the active user.
- **Response (200 OK)**: `{ "success": true, "message": "Decision deleted successfully." }`

### `GET /api/decisions/db-health`
Runs a live `{ ping: 1 }` command on MongoDB Atlas.
- **Response**:
```json
{
  "connected": true,
  "database": "blindspot_db",
  "count": 12,
  "message": "MongoDB Atlas is actively connected and reachable!"
}
```

---

## 4. Configuration & Environment Variables

### Backend Configuration (`backend/src/main/resources/application.yml`)
```yaml
server:
  port: ${SERVER_PORT:8080}

spring:
  application:
    name: blindspot-backend
  data:
    mongodb:
      uri: ${SPRING_DATA_MONGODB_URI:mongodb+srv://harshalmendhule3:harshal2005@cluster0.qmxfmkj.mongodb.net/blindspot_db?retryWrites=true&w=majority}
      database: ${SPRING_DATA_MONGODB_DATABASE:blindspot_db}
      auto-index-creation: true

gemini:
  api-key: ${GEMINI_API_KEY:}
  models: ${GEMINI_MODELS:gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.8-flash,gemini-3.5-flash}

firebase:
  project-id: ${FIREBASE_PROJECT_ID:promptwars-db2f0}

cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000,http://localhost:8080}
```

### Frontend Configuration (`frontend/.env`)
```bash
# Firebase Client Config (Safe for public bundle)
VITE_FIREBASE_API_KEY=AIzaSyBK_KzCjbeWX4rP3xD33QYjvWINS49U_XQ
VITE_FIREBASE_AUTH_DOMAIN=promptwars-db2f0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=promptwars-db2f0
VITE_FIREBASE_STORAGE_BUCKET=promptwars-db2f0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=236786444201
VITE_FIREBASE_APP_ID=1:236786444201:web:0a313b32061ec79eef86b8
VITE_FIREBASE_MEASUREMENT_ID=G-8536JD419F

# Optional Backend URL (defaults to http://localhost:8080 via Vite proxy)
VITE_BACKEND_URL=http://localhost:8080
```

---

## 5. Security & Isolation Model

1. **Zero Secret Leakage in Client Bundles**:
   - `geminiClient.ts` browser-side REST calls have been completely removed.
   - `GEMINI_API_KEY` is loaded strictly on the Spring Boot backend and is never sent to the browser.
2. **Cryptographic Firebase Token Verification**:
   - Spring Boot verifies Firebase ID tokens using Google's public JWKS endpoint (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`).
   - Verifies issuer (`https://securetoken.google.com/{projectId}`), audience, and RSA256 signature.
3. **User-Scoped Isolation**:
   - Decision records are tagged with `userId` and indexed.
   - Deletions and reads enforce `userId == activeUid`.
   - Anonymous/guest sessions are assigned unique, deterministic session IDs so guest data is never shared across users.
4. **Robust Input Validation**:
   - Jakarta Bean Validation enforces length limits ($\ge 5$ characters for decisions, min 2 options) to protect against malformed payloads and prompt injection.

---

## 6. How to Build, Test, and Run

### Prerequisites
- Java 21+ (`java -version`)
- Maven 3.9+ (or use the packaged `mvn.cmd` / `mvnw`)
- Node.js 18+ and npm (`node -v`, `npm -v`)

### Running the Spring Boot Backend
```powershell
# Navigate to backend directory
cd "d:\Projects\BlindSpot AI SpringB\backend"

# Build and run tests
mvn clean test

# Run the backend locally on port 8080
mvn spring-boot:run
```

### Running the React Frontend
```powershell
# Navigate to frontend directory
cd "d:\Projects\BlindSpot AI SpringB\frontend"

# Install dependencies (if not already installed)
npm install

# Run frontend tests
npm run test

# Start Vite dev server on port 5173
npm run dev
```

Visit **`http://localhost:5173`** in your browser. All requests to `/api/*` are automatically proxied to the Spring Boot backend at `http://localhost:8080`.
