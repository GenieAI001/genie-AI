import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, settingsTable, KNOWN_SETTING_KEYS } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

function toRecord(rows: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// --- Public: only non-secret settings (e.g. AdMob unit IDs) ---
// Used by the mobile app to configure ads without hardcoding IDs in the bundle.
router.get("/settings/public", async (_req, res) => {
  const rows = await db.select().from(settingsTable).where(eq(settingsTable.isSecret, false));
  res.json(toRecord(rows));
});

// --- Admin: every setting, including secrets like API keys ---
router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(settingsTable);
  res.json(rows);
});

const upsertSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  isSecret: z.boolean().optional(),
});

router.put("/admin/settings/:key", requireAdmin, async (req, res) => {
  const parsed = upsertSchema.omit({ key: true }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid setting value", issues: parsed.error.issues });
    return;
  }

  const key = req.params.key;
  const known = (KNOWN_SETTING_KEYS as Record<string, { isSecret: boolean }>)[key];
  const isSecret = parsed.data.isSecret ?? known?.isSecret ?? true;

  const [row] = await db
    .insert(settingsTable)
    .values({ key, value: parsed.data.value, isSecret, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: parsed.data.value, isSecret, updatedAt: new Date() },
    })
    .returning();

  res.json(row);
});

router.delete("/admin/settings/:key", requireAdmin, async (req, res) => {
  const [row] = await db
    .delete(settingsTable)
    .where(eq(settingsTable.key, req.params.key))
    .returning();

  if (!row) {
    res.status(404).json({ message: "Setting not found" });
    return;
  }
  res.status(204).send();
});

export default router;
