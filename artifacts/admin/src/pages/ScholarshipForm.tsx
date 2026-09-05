import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createScholarshipAdmin,
  getScholarshipAdmin,
  updateScholarshipAdmin,
  type ScholarshipLevel,
} from "@workspace/api-client-react";
import Layout from "@/components/Layout";

const LEVELS: ScholarshipLevel[] = ["bachelor", "master", "phd"];

interface FormState {
  name: string;
  provider: string;
  country: string;
  amount: string;
  levels: ScholarshipLevel[];
  deadline: string;
  minCgpa: string;
  minIelts: string;
  tags: string;
  description: string;
  fields: string;
  isActive: boolean;
}

const EMPTY: FormState = {
  name: "",
  provider: "",
  country: "",
  amount: "",
  levels: [],
  deadline: "",
  minCgpa: "0",
  minIelts: "0",
  tags: "",
  description: "",
  fields: "",
  isActive: true,
};

function inputClass() {
  return "w-full rounded-[var(--radius-sm)] bg-[var(--ink-800)] border border-[var(--ink-600)] px-3 py-2 text-sm placeholder:text-[var(--ink-400)] focus:border-[var(--amber-500)]";
}

function labelClass() {
  return "block text-sm font-medium mb-1.5 text-[var(--ink-200)]";
}

export default function ScholarshipForm() {
  const params = useParams<{ id?: string }>();
  const isEdit = Boolean(params.id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const { data: existing } = useQuery({
    queryKey: ["admin-scholarship", params.id],
    queryFn: () => getScholarshipAdmin(params.id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        provider: existing.provider,
        country: existing.country,
        amount: existing.amount,
        levels: existing.levels,
        deadline: existing.deadline,
        minCgpa: String(existing.minCgpa),
        minIelts: String(existing.minIelts),
        tags: existing.tags.join(", "),
        description: existing.description,
        fields: existing.fields.join(", "),
        isActive: existing.isActive,
      });
    }
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        provider: form.provider,
        country: form.country,
        amount: form.amount,
        levels: form.levels,
        deadline: form.deadline,
        minCgpa: Number(form.minCgpa) || 0,
        minIelts: Number(form.minIelts) || 0,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        description: form.description,
        fields: form.fields.split(",").map((f) => f.trim()).filter(Boolean),
        isActive: form.isActive,
      };
      return isEdit ? updateScholarshipAdmin(params.id!, payload) : createScholarshipAdmin(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scholarships"] });
      navigate("/");
    },
    onError: () => setError("Couldn't save. Check the fields and try again."),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    save.mutate();
  }

  function toggleLevel(level: ScholarshipLevel) {
    setForm((f) => ({
      ...f,
      levels: f.levels.includes(level) ? f.levels.filter((l) => l !== level) : [...f.levels, level],
    }));
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{isEdit ? "Edit scholarship" : "New scholarship"}</h1>
        <button onClick={() => navigate("/")} className="text-sm text-[var(--ink-400)] hover:text-[var(--paper)]">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-[var(--ink-900)] border border-[var(--ink-700)] rounded-[var(--radius-lg)] p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass()}>Name</label>
            <input required className={inputClass()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Provider</label>
            <input required className={inputClass()} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Country</label>
            <input required className={inputClass()} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Amount</label>
            <input required placeholder="e.g. Full funding + stipend" className={inputClass()} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Deadline</label>
            <input required placeholder="e.g. Nov 5 or Rolling" className={inputClass()} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Visible in the app
            </label>
          </div>
          <div>
            <label className={labelClass()}>Minimum CGPA</label>
            <input type="number" step="0.01" className={inputClass()} value={form.minCgpa} onChange={(e) => setForm({ ...form, minCgpa: e.target.value })} />
          </div>
          <div>
            <label className={labelClass()}>Minimum IELTS</label>
            <input type="number" step="0.5" className={inputClass()} value={form.minIelts} onChange={(e) => setForm({ ...form, minIelts: e.target.value })} />
          </div>
        </div>

        <div>
          <label className={labelClass()}>Degree levels</label>
          <div className="flex gap-2">
            {LEVELS.map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => toggleLevel(level)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-sm capitalize border transition-colors ${
                  form.levels.includes(level)
                    ? "bg-[var(--amber-500)] text-[var(--ink-950)] border-[var(--amber-500)] font-medium"
                    : "border-[var(--ink-600)] text-[var(--ink-200)]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass()}>Tags (comma separated)</label>
          <input placeholder="Leadership, Government, Full Funding" className={inputClass()} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>

        <div>
          <label className={labelClass()}>Fields of study (comma separated)</label>
          <input placeholder="All fields, or e.g. Engineering, Public Health" className={inputClass()} value={form.fields} onChange={(e) => setForm({ ...form, fields: e.target.value })} />
        </div>

        <div>
          <label className={labelClass()}>Description</label>
          <textarea rows={3} className={inputClass()} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="rounded-[var(--radius-sm)] bg-[var(--amber-500)] text-[var(--ink-950)] font-semibold px-5 py-2.5 text-sm disabled:opacity-50 hover:bg-[var(--amber-400)] transition-colors"
          >
            {save.isPending ? "Saving…" : "Save scholarship"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
