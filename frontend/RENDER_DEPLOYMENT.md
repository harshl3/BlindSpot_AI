# Render Deployment Guide — BlindSpot AI

This guide provides the exact production configuration to deploy **BlindSpot AI** to [Render](https://render.com) using a two-service architecture:
1. **Backend**: Render Web Service (Docker container running Spring Boot 3.4 on Java 21)
2. **Frontend**: Render Static Site (React 19 + TypeScript + Vite)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Render Static Site (Frontend)                        │
│                 https://blindspot-app.onrender.com                     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                    HTTPS Requests   │ VITE_API_BASE_URL
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Render Web Service (Docker Backend)                   │
│                https://blindspot-backend.onrender.com                  │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
      ┌─────────────────────────┐       ┌────────────────────────┐
      │      MongoDB Atlas      │       │   Google Gemini API    │
      │     (blindspot_db)      │       │ (3.5-flash-lite / etc) │
      └─────────────────────────┘       └────────────────────────┘
```

---

## 🛠 Service 1: Backend (Render Web Service)

Deploy the backend first so you have its production URL ready for the frontend.

### Service Settings
| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Service Type** | `Web Service` | |
| **Name** | `blindspot-backend` | Or any preferred name |
| **Region** | Oregon (US West) or Frankfurt | Match your MongoDB cluster region |
| **Branch** | `main` | |
| **Root Directory** | `backend` | Runs Docker build inside `/backend` |
| **Runtime** | `Docker` | Automatically detects `backend/Dockerfile` |
| **Dockerfile Path** | `Dockerfile` | Relative to root directory `backend` |
| **Docker Context** | `.` | Relative to root directory `backend` |
| **Instance Type** | `Free` or `Starter` | |
| **Health Check Path** | `/api/health` | Returns `{"status":"UP",...}` |

### Environment Variables
Configure these under **Environment** in the Render Web Service dashboard:

| Variable | Recommended Value / Example | Required | Notes |
| :--- | :--- | :---: | :--- |
| `SPRING_DATA_MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.qmxfmkj.mongodb.net/blindspot_db?retryWrites=true&w=majority` | **Yes** | Your Atlas connection string |
| `SPRING_DATA_MONGODB_DATABASE` | `blindspot_db` | **Yes** | Database name |
| `GEMINI_API_KEY` | `AQ.Ab8RN6...` | **Yes** | Kept secure on server |
| `GEMINI_MODELS` | `gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.8-flash,gemini-3.5-flash` | No | Cascading fallback list |
| `FIREBASE_PROJECT_ID` | `promptwars-db2f0` | **Yes** | Verifies Google Auth JWT tokens |
| `CORS_ALLOWED_ORIGINS` | `https://*.onrender.com,http://localhost:5173` | **Yes** | Add your custom domain if applicable |
| `PORT` | *(Leave empty)* | Auto | Render injects dynamic `PORT` |

> [!NOTE]
> Spring Boot automatically binds to Render's dynamic port via `${PORT:${SERVER_PORT:8080}}` and the Dockerfile entrypoint `-Dserver.port=${PORT}`.

---

## 🌐 Service 2: Frontend (Render Static Site)

Once the backend is live, copy its URL (e.g., `https://blindspot-backend.onrender.com`) to configure the frontend.

### Service Settings
| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Service Type** | `Static Site` | Fast CDN-hosted SPA |
| **Name** | `blindspot-app` | Or any preferred name |
| **Branch** | `main` | |
| **Root Directory** | `frontend` | Runs build inside `/frontend` |
| **Build Command** | `npm install && npm run build` | Builds with Vite to `/dist` |
| **Publish Directory** | `dist` | Relative to `frontend` |

### Environment Variables
Configure these under **Environment** in the Render Static Site dashboard:

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://blindspot-backend.onrender.com` | **Do not include trailing slash** |
| `VITE_FIREBASE_API_KEY` | `AIzaSyBK_KzCjbeWX4rP3xD33QYjvWINS49U_XQ` | Safe public client config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `promptwars-db2f0.firebaseapp.com` | Safe public client config |
| `VITE_FIREBASE_PROJECT_ID` | `promptwars-db2f0` | Safe public client config |
| `VITE_FIREBASE_STORAGE_BUCKET` | `promptwars-db2f0.firebasestorage.app` | Safe public client config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `236786444201` | Safe public client config |
| `VITE_FIREBASE_APP_ID` | `1:236786444201:web:0a313b32061ec79eef86b8` | Safe public client config |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-8536JD419F` | Safe public client config |

### SPA Rewrite / Redirect Rule
To allow browser page refreshes on subroutes without 404 errors:
1. In the Render Dashboard, go to your Static Site **Redirects / Rewrites** tab.
2. Add a rule:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
*(Note: `frontend/public/_redirects` is also bundled into `dist/_redirects` automatically for static hosting providers).*

---

## 🔒 Security & Secrets Checklist

- [x] **Zero Gemini Key Leakage**: `GEMINI_API_KEY` is defined exclusively in the backend Render Web Service environment and never in the frontend.
- [x] **Safe `.dockerignore`**: `backend/.dockerignore` excludes all `.env` files, `.git`, `target/`, and development secrets from being copied into the container.
- [x] **Safe `.gitignore`**: Root `.gitignore` prevents `.env`, `node_modules/`, and `target/` from being committed to GitHub.
- [x] **Dynamic Port Binding**: Spring Boot respects Render's dynamic `$PORT` variable.
- [x] **CORS Whitelist**: `backend/src/main/resources/application.yml` permits requests from `https://*.onrender.com` and `http://localhost:5173`.
- [x] **Isolated Database Access**: Backend accesses MongoDB Atlas via least-privilege user credentials over encrypted TLS (`mongodb+srv`).

---

## 🧪 Post-Deployment Verification

1. **Test Backend Health Endpoint**:
   ```bash
   curl -i https://blindspot-backend.onrender.com/api/health
   ```
   Expected response:
   ```json
   {"status":"UP","modelsAvailable":true,"timestamp":"..."}
   ```

2. **Test MongoDB Atlas Connectivity**:
   ```bash
   curl -i https://blindspot-backend.onrender.com/api/decisions/db-health
   ```
   Expected response:
   ```json
   {"connected":true,"database":"blindspot_db","message":"MongoDB Atlas is actively connected and reachable!"}
   ```

3. **Open Frontend URL**:
   - Navigate to `https://blindspot-app.onrender.com`
   - Submit a test decision (e.g. *"Launch product now vs 4 more weeks polishing"*)
   - Verify 8-section report loads and Decision Map renders smoothly
   - Click **Save Decision**: verify MongoDB confirmation badge and celebratory confetti

