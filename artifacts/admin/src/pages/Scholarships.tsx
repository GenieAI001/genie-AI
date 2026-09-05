import { useState } from "react";
import { Link } from "@/lib/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteScholarshipAdmin, listAllScholarshipsAdmin } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

export default function Scholarships() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-scholarships"],
    queryFn: listAllScholarshipsAdmin,
  });

  const remove = useMutation({
    mutationFn: deleteScholarshipAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-scholarships"] }),
  });

  const filtered = (data ?? []).filter((s) =>
    `${s.name} ${s.provider} ${s.country}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Scholarships</h1>
          <p className="text-sm text-[var(--ink-400)] mt-1">
            {data ? `${data.length} total` : "Loading…"}
          </p>
        </div>
        <Link
          href="/scholarships/new"
          className="rounded-[var(--radius-sm)] bg-[var(--amber-500)] text-[var(--ink-950)] font-semibold px-4 py-2 text-sm hover:bg-[var(--amber-400)] transition-colors"
        >
          + Add scholarship
        </Link>
      </div>

      <input
        placeholder="Search by name, provider, or country…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 rounded-[var(--radius-sm)] bg-[var(--ink-800)] border border-[var(--ink-600)] px-3 py-2 text-sm placeholder:text-[var(--ink-400)] focus:border-[var(--amber-500)]"
      />

      {isLoading && <p className="text-sm text-[var(--ink-400)]">Loading scholarships…</p>}
      {isError && <p className="text-sm text-[var(--danger)]">Couldn't load scholarships. Is the API server running?</p>}

      <div className="border border-[var(--ink-700)] rounded-[var(--radius-lg)] overflow-hidden">
        {filtered.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center justify-between px-5 py-3.5 ${i !== 0 ? "border-t border-[var(--ink-700)]" : ""} ${
              s.isActive ? "" : "opacity-50"
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{s.name}</span>
                {!s.isActive && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--ink-700)] text-[var(--ink-200)] shrink-0">
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--ink-400)] mt-0.5 truncate">
                {s.provider} · {s.country} · Deadline: {s.deadline}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
              <Link href={`/scholarships/${s.id}/edit`} className="text-sm text-[var(--ink-200)] hover:text-[var(--paper)]">
                Edit
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete "${s.name}"? This can't be undone.`)) remove.mutate(s.id);
                }}
                className="text-sm text-[var(--danger)] hover:opacity-80"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!isLoading && filtered.length === 0 && (
          <p className="px-5 py-8 text-sm text-[var(--ink-400)] text-center">
            {search ? "No scholarships match your search." : "No scholarships yet — add the first one."}
          </p>
        )}
      </div>
    </Layout>
  );
}
