// src/utils/api.ts
// Centralized fetch wrapper that handles auth automatically.
// On 401 (expired token, invalid signature, missing auth), logs out and redirects.

// Base URL configuration - typically updated for Member 2's backend environment[cite: 11]
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Standard logout utility for the application infrastructure.
 * Clears session data and redirects to login[cite: 10, 11].
 */
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Use replace so the back button doesn't return to a protected page.
  // We check if we're already on /login to prevent infinite redirect loops.
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

/**
 * Validates JWT token integrity and expiry.
 * Essential for Member 2's protected routes like Ward Coordination[cite: 11, 15].
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true; // Check for malformed JWT

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false; // No expiry set = treat as valid

    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Decoding error = treat as expired
  }
};

/**
 * High-order fetch wrapper.
 * Automatically injects Member 2's required Auth headers and handles base URLs[cite: 11, 12].
 */
export const apiFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = localStorage.getItem("token");

  // Validate token before making a request to Member 2's API[cite: 11]
  if (token && isTokenExpired(token)) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  try {
    const res = await fetch(url, { ...options, headers });

    // 401 = Unauthorized. Occurs when token is invalid or signature fails.
    // Member 2's backend uses this for session protection[cite: 11, 12].
    if (res.status === 401) {
      logout();
      throw new Error("Unauthorized access. Please log in again.");
    }

    return res;
  } catch (error) {
    // Handling network errors or server-down scenarios
    console.error("API Call failed:", error);
    throw error;
  }
};
