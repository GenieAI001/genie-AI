import { customFetch } from "./custom-fetch";

export interface Setting {
  key: string;
  value: string;
  isSecret: boolean;
  updatedAt: string;
}

/** Public: non-secret settings only, e.g. AdMob ad unit IDs. Used by the mobile app. */
export function getPublicSettings(): Promise<Record<string, string>> {
  return customFetch<Record<string, string>>("/api/settings/public");
}

/** Admin: every setting, including secrets like API keys. */
export function listSettingsAdmin(): Promise<Setting[]> {
  return customFetch<Setting[]>("/api/admin/settings");
}

export function updateSettingAdmin(
  key: string,
  value: string,
  isSecret?: boolean,
): Promise<Setting> {
  return customFetch<Setting>(`/api/admin/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ value, isSecret }),
  });
}

export function deleteSettingAdmin(key: string): Promise<null> {
  return customFetch<null>(`/api/admin/settings/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}
