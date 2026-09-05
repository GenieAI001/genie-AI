import { pgTable, text, real, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scholarshipsTable = pgTable("scholarships", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  country: text("country").notNull(),
  amount: text("amount").notNull(),
  // e.g. ["bachelor", "master", "phd"]
  levels: text("levels").array().notNull().default([]),
  // Free-text deadline as shown to users, e.g. "Nov 5" or "Rolling"
  deadline: text("deadline").notNull(),
  minCgpa: real("min_cgpa").notNull().default(0),
  minIelts: real("min_ielts").notNull().default(0),
  tags: text("tags").array().notNull().default([]),
  description: text("description").notNull().default(""),
  fields: text("fields").array().notNull().default([]),
  // Lets an admin hide a scholarship (e.g. deadline passed) without deleting it
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertScholarshipSchema = createInsertSchema(scholarshipsTable, {
  levels: z.array(z.enum(["bachelor", "master", "phd"])).default([]),
})
  .omit({ id: true, createdAt: true, updatedAt: true });

export const updateScholarshipSchema = insertScholarshipSchema.partial();

export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type UpdateScholarship = z.infer<typeof updateScholarshipSchema>;
export type Scholarship = typeof scholarshipsTable.$inferSelect;
