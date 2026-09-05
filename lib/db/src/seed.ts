/**
 * One-time seed: loads the scholarships that used to be hardcoded in
 * `artifacts/mobile/constants/scholarships.ts` into the database, so the
 * admin dashboard starts with real content instead of an empty table.
 *
 * Safe to re-run: it skips any scholarship whose `name` already exists.
 *
 * Usage: pnpm --filter @workspace/db run seed
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { db, scholarshipsTable } from "./index";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface LegacyScholarship {
  id: string;
  name: string;
  provider: string;
  country: string;
  amount: string;
  levels: string[];
  deadline: string;
  minCGPA: number;
  minIELTS: number;
  tags: string[];
  description: string;
  fields: string[];
}

async function seed() {
  const raw = readFileSync(join(__dirname, "seedData", "scholarships.json"), "utf8");
  const legacy: LegacyScholarship[] = JSON.parse(raw);

  const existing = await db.select({ name: scholarshipsTable.name }).from(scholarshipsTable);
  const existingNames = new Set(existing.map((r) => r.name));

  const toInsert = legacy
    .filter((s) => !existingNames.has(s.name))
    .map((s) => ({
      name: s.name,
      provider: s.provider,
      country: s.country,
      amount: s.amount,
      levels: s.levels,
      deadline: s.deadline,
      minCgpa: s.minCGPA,
      minIelts: s.minIELTS,
      tags: s.tags,
      description: s.description,
      fields: s.fields,
      isActive: true,
    }));

  if (toInsert.length === 0) {
    console.log("Nothing to seed — all scholarships already exist in the database.");
    return;
  }

  await db.insert(scholarshipsTable).values(toInsert);
  console.log(`Seeded ${toInsert.length} scholarships (skipped ${legacy.length - toInsert.length} already present).`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
