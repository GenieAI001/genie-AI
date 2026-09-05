import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Generic key/value settings store.
 *
 * Used for things an admin needs to change at runtime without a redeploy:
 * AdMob IDs, third-party API keys, feature flags, etc.
 *
 * `isSecret` rows (e.g. API keys) are never returned by the public settings
 * endpoint — only by the admin-authenticated one. `isSecret: false` rows
 * (e.g. AdMob ad unit IDs, which the mobile app must read) are safe to
 * expose publicly since they aren't sensitive.
 */
export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  isSecret: boolean("is_secret").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settingsTable).omit({
  updatedAt: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settingsTable.$inferSelect;

/** Known setting keys the app understands. Admins can still add arbitrary ones. */
export const KNOWN_SETTING_KEYS = {
  ADMOB_APP_ID_IOS: { isSecret: false },
  ADMOB_APP_ID_ANDROID: { isSecret: false },
  ADMOB_BANNER_UNIT_ID_IOS: { isSecret: false },
  ADMOB_BANNER_UNIT_ID_ANDROID: { isSecret: false },
  ADMOB_INTERSTITIAL_UNIT_ID_IOS: { isSecret: false },
  ADMOB_INTERSTITIAL_UNIT_ID_ANDROID: { isSecret: false },
  ADMOB_REWARDED_UNIT_ID_IOS: { isSecret: false },
  ADMOB_REWARDED_UNIT_ID_ANDROID: { isSecret: false },
  AI_ADVISOR_API_KEY: { isSecret: true },
} as const;

export type KnownSettingKey = keyof typeof KNOWN_SETTING_KEYS;
