import { customFetch } from "./custom-fetch";

export function adminLogin(password: string): Promise<{ token: string }> {
  return customFetch<{ token: string }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
