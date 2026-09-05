import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, scholarshipsTable, insertScholarshipSchema, updateScholarshipSchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

// --- Public: only active scholarships, no admin token required ---
// Used by the mobile app.
router.get("/scholarships", async (_req, res) => {
  const rows = await db
    .select()
    .from(scholarshipsTable)
    .where(eq(scholarshipsTable.isActive, true));
  res.json(rows);
});

// --- Admin: every scholarship, including hidden/inactive ones ---
router.get("/admin/scholarships", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(scholarshipsTable);
  res.json(rows);
});

router.get("/admin/scholarships/:id", requireAdmin, async (req, res) => {
  const [row] = await db
    .select()
    .from(scholarshipsTable)
    .where(eq(scholarshipsTable.id, req.params.id));

  if (!row) {
    res.status(404).json({ message: "Scholarship not found" });
    return;
  }
  res.json(row);
});

router.post("/admin/scholarships", requireAdmin, async (req, res) => {
  const parsed = insertScholarshipSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid scholarship data", issues: parsed.error.issues });
    return;
  }

  const [row] = await db.insert(scholarshipsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/scholarships/:id", requireAdmin, async (req, res) => {
  const parsed = updateScholarshipSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid scholarship data", issues: parsed.error.issues });
    return;
  }

  const [row] = await db
    .update(scholarshipsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(scholarshipsTable.id, req.params.id))
    .returning();

  if (!row) {
    res.status(404).json({ message: "Scholarship not found" });
    return;
  }
  res.json(row);
});

router.delete("/admin/scholarships/:id", requireAdmin, async (req, res) => {
  const [row] = await db
    .delete(scholarshipsTable)
    .where(eq(scholarshipsTable.id, req.params.id))
    .returning();

  if (!row) {
    res.status(404).json({ message: "Scholarship not found" });
    return;
  }
  res.status(204).send();
});

export default router;
