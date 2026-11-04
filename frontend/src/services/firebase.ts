import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
  type Auth
} from "firebase/auth";
import type { SavedDecisionRecord } from "../types/decision";
import {
  saveDecisionToBackend,
  fetchDecisionsFromBackend,
  deleteDecisionFromBackend
} from "./api";

// Firebase web configuration (loaded from environment)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Singleton App initialization
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Attempt Anonymous Sign-In so user gets an authenticated Firebase UID automatically
 */
export async function initAnonymousAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    console.log("[Firebase] Anonymous session active, UID:", cred.user.uid);
    return cred.user;
  } catch {
    console.info("[Firebase] Anonymous sign-in not enabled in console, using Google Sign-in or session ID.");
    return null;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  initAnonymousAuth().then((anonUser) => {
    if (anonUser) callback(anonUser);
  });
  return onAuthStateChanged(auth, callback);
}

// Session isolation for non-authenticated guests
const GUEST_SESSION_KEY = "blindspot_guest_session_id_v1";

function getGuestSessionId(): string {
  try {
    let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
    if (!sessionId) {
      sessionId = "guest_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(GUEST_SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return "guest_ephemeral";
  }
}

// LocalStorage key for backup resilience
const LOCAL_STORAGE_KEY = "blindspot_decisions_local_v1";

function getLocalRecords(): SavedDecisionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRecords(records: SavedDecisionRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }
}

export interface PersistenceResult {
  record: SavedDecisionRecord;
  storageType: "mongodb" | "local";
  message: string;
  error?: string;
}

/**
 * Save decision record directly to Spring Boot + MongoDB Atlas as primary database
 */
export async function saveDecisionRecord(
  recordData: Omit<SavedDecisionRecord, "id" | "createdAt" | "updatedAt">,
  currentUser: User | null
): Promise<PersistenceResult> {
  const activeUser = currentUser || auth.currentUser;
  let idToken: string | undefined;

  if (activeUser) {
    try {
      idToken = await activeUser.getIdToken();
    } catch (e) {
      console.warn("Could not retrieve ID token:", e);
    }
  }

  const guestSession = getGuestSessionId();

  // 1. PRIMARY: Write to MongoDB Atlas via Spring Boot backend
  try {
    const res = await saveDecisionToBackend(recordData, idToken, guestSession);

    // Update local cache
    const currentRecords = getLocalRecords();
    saveLocalRecords([res.record, ...currentRecords.filter(r => r.id !== res.record.id)]);

    return {
      record: res.record,
      storageType: "mongodb",
      message: res.message || "Successfully stored in MongoDB Atlas!"
    };
  } catch (backendErr: unknown) {
    console.warn("[Backend Persistence] Spring Boot write failed, falling back to local storage:", backendErr);

    // 2. FALLBACK: Local device storage if backend is unreachable
    const now = new Date().toISOString();
    const localId = "local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const fullRecord: SavedDecisionRecord = {
      ...recordData,
      id: localId,
      userId: activeUser?.uid || guestSession,
      createdAt: now,
      updatedAt: now
    };

    const currentRecords = getLocalRecords();
    saveLocalRecords([fullRecord, ...currentRecords]);

    const errMsg = backendErr instanceof Error ? backendErr.message : "Server unreachable";
    return {
      record: fullRecord,
      storageType: "local",
      message: `Saved locally. Backend note: ${errMsg}`,
      error: errMsg
    };
  }
}

/**
 * Load user decision records from MongoDB Atlas via Spring Boot backend
 */
export async function loadDecisionRecords(currentUser: User | null): Promise<{
  records: SavedDecisionRecord[];
  source: "mongodb" | "local";
}> {
  const activeUser = currentUser || auth.currentUser;
  let idToken: string | undefined;

  if (activeUser) {
    try {
      idToken = await activeUser.getIdToken();
    } catch (e) {
      console.warn("Could not retrieve ID token:", e);
    }
  }

  const guestSession = getGuestSessionId();

  try {
    const records = await fetchDecisionsFromBackend(idToken, guestSession);
    if (records && records.length > 0) {
      return { records, source: "mongodb" };
    }
  } catch (err) {
    console.warn("[Backend Persistence] Could not fetch decisions from Spring Boot backend:", err);
  }

  // Fallback to local storage cache
  const localRecords = getLocalRecords();
  return { records: localRecords, source: "local" };
}

/**
 * Delete a decision record
 */
export async function deleteDecisionRecord(recordId: string, currentUser?: User | null): Promise<void> {
  const activeUser = currentUser || auth.currentUser;
  let idToken: string | undefined;

  if (activeUser) {
    try {
      idToken = await activeUser.getIdToken();
    } catch (e) {
      console.warn("Could not retrieve ID token:", e);
    }
  }

  const guestSession = getGuestSessionId();

  if (!recordId.startsWith("local_")) {
    try {
      await deleteDecisionFromBackend(recordId, idToken, guestSession);
    } catch (err) {
      console.error("[Backend Persistence] Backend delete error:", err);
    }
  }

  // Also remove from local cache
  const records = getLocalRecords().filter(r => r.id !== recordId);
  saveLocalRecords(records);
}
