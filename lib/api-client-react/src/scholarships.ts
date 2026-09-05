import { customFetch } from "./custom-fetch";

/**
 * Hand-written client for the scholarships endpoints.
 *
 * Not orval-generated (there's no OpenAPI-driven codegen set up for these
 * routes yet) — this mirrors the shape/style of the generated files so it's
 * easy to swap out later. Used by both the mobile app (public read) and the
 * admin dashboard (full CRUD, needs an admin token via setAuthTokenGetter).
 */

export type ScholarshipLevel = "bachelor" | "master" | "phd";

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  country: string;
  amount: string;
  levels: ScholarshipLevel[];
  deadline: string;
  minCgpa: number;
  minIelts: number;
  tags: string[];
  description: string;
  fields: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ScholarshipInput = Omit<
  Scholarship,
  "id" | "createdAt" | "updatedAt" | "isActive"
> & { isActive?: boolean };

/** Public: active scholarships only. No admin token required. */
export function listScholarships(): Promise<Scholarship[]> {
  return customFetch<Scholarship[]>("/api/scholarships");
}

/** Admin: every scholarship, including hidden/inactive ones. */
export function listAllScholarshipsAdmin(): Promise<Scholarship[]> {
  return customFetch<Scholarship[]>("/api/admin/scholarships");
}

export function getScholarshipAdmin(id: string): Promise<Scholarship> {
  return customFetch<Scholarship>(`/api/admin/scholarships/${id}`);
}

export function createScholarshipAdmin(input: ScholarshipInput): Promise<Scholarship> {
  return customFetch<Scholarship>("/api/admin/scholarships", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateScholarshipAdmin(
  id: string,
  input: Partial<ScholarshipInput>,
): Promise<Scholarship> {
  return customFetch<Scholarship>(`/api/admin/scholarships/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteScholarshipAdmin(id: string): Promise<null> {
  return customFetch<null>(`/api/admin/scholarships/${id}`, {
    method: "DELETE",
  });
}
