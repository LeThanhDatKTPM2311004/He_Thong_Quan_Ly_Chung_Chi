import type { AuthUser } from "../types";

const USER_KEY = "certchain.user";
const TOKEN_KEY = "certchain.token";

export function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeSession(user: AuthUser, token?: string | null) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredRole(): string | null {
  return loadStoredUser()?.role ?? null;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
