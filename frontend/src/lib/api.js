import { authClient } from "./auth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  let token = null;

  // Try to get the current session without calling
  // the broken /get-jwt-token endpoint.
  try {
    const sessionResult = await authClient.getSession();

    token =
      sessionResult?.data?.session?.token || null;
  } catch (error) {
    // Public endpoints such as /api/documents can still work
    // without an authentication token.
    console.warn(
      "[apiFetch] Session unavailable:",
      error?.message
    );
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        `HTTP ${response.status}`
    );
  }

  return data;
}