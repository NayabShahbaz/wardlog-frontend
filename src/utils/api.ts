// src/utils/api.ts
// Centralized fetch wrapper that handles auth automatically.
// On 401 (expired token, invalid signature, missing auth), logs out and redirects.

const API_BASE = "http://localhost:5000";

export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Use replace so the back button doesn't return to a protected page
  window.location.replace("/login");
};

// Returns true if the token is expired or malformed.
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false; // No expiry set = treat as valid
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Malformed = treat as expired
  }
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(url, { ...options, headers });

  // 401 = token expired, invalid signature, or missing.
  // Log out and redirect immediately.
  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  return res;
};
