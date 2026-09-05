import { useCallback, useEffect, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const STORAGE_KEY = "opgenie_admin_token";

let currentToken: string | null = localStorage.getItem(STORAGE_KEY);
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getToken(): string | null {
  return currentToken;
}

export function setToken(token: string | null): void {
  currentToken = token;
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  notify();
}

// Every request made through @workspace/api-client-react automatically
// attaches this as `Authorization: Bearer <token>`.
setAuthTokenGetter(() => currentToken);

/** React hook: re-renders when login/logout happens anywhere in the app. */
export function useAuth() {
  const [token, setTokenState] = useState(currentToken);

  useEffect(() => {
    const listener = () => setTokenState(currentToken);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const logout = useCallback(() => setToken(null), []);

  return { token, isAuthenticated: token !== null, logout };
}
