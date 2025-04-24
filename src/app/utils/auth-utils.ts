/**
 * Utility functions for authentication and user profile management
 */

/**
 * Extracts username from JWT token
 * @param token JWT token string
 * @returns username or null if not found/invalid
 */
export function extractUsernameFromToken(token: string): string | null {
  if (!token) return null;

  try {
    // Simple JWT parsing (assuming JWT format)
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    // Check various fields where username might be stored
    if (payload.username) return payload.username;
    if (payload.name) return payload.name;
    if (payload.sub) return payload.sub;
    if (payload.email) return payload.email.split("@")[0];

    return null;
  } catch (e) {
    console.error("Error parsing token:", e);
    return null;
  }
}

/**
 * Gets the current user's username from various sources
 * @returns The username or "User" if not found
 */
export function getCurrentUsername(): string {
  // Try localStorage first
  const storedUsername = localStorage.getItem("username");
  if (storedUsername && storedUsername !== "User") {
    return storedUsername;
  }

  // Try token
  const token = localStorage.getItem("token");
  if (token) {
    const tokenUsername = extractUsernameFromToken(token);
    if (tokenUsername) {
      // Store for future use
      localStorage.setItem("username", tokenUsername);
      return tokenUsername;
    }
  }

  // Try email
  const storedEmail = localStorage.getItem("email");
  if (storedEmail) {
    const emailUsername = storedEmail.split("@")[0];
    localStorage.setItem("username", emailUsername);
    return emailUsername;
  }

  return "User";
}

/**
 * Checks if user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("token");
  return !!token;
}
