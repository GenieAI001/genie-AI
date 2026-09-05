import type { ReactNode } from "react";
import { Link, useLocation } from "@/lib/router";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "Scholarships" },
  { href: "/settings", label: "Settings & API keys" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-[var(--ink-700)] bg-[var(--ink-900)] flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--amber-500)] text-[var(--ink-950)] font-bold text-sm flex items-center justify-center shrink-0">
            OG
          </div>
          <span className="font-semibold text-sm leading-tight">OpportunityGenie AI</span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[var(--ink-700)] text-[var(--paper)] font-medium"
                    : "text-[var(--ink-200)] hover:bg-[var(--ink-800)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--ink-700)]">
          <button
            onClick={logout}
            className="w-full text-left rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--ink-400)] hover:bg-[var(--ink-800)] hover:text-[var(--paper)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
