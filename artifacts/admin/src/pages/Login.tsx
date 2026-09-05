import { useState, type FormEvent } from "react";
import { adminLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      setToken(token);
    } catch {
      setError("Incorrect password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--amber-500)] text-[var(--ink-950)] font-bold text-lg mb-4">
            OG
          </div>
          <h1 className="text-xl font-semibold">OpportunityGenie AI</h1>
          <p className="text-sm text-[var(--ink-400)] mt-1">Admin dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--ink-900)] border border-[var(--ink-700)] rounded-[var(--radius-lg)] p-6"
        >
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-[var(--ink-200)]">
            Admin password
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] bg-[var(--ink-800)] border border-[var(--ink-600)] px-3 py-2.5 text-sm placeholder:text-[var(--ink-400)] focus:border-[var(--amber-500)]"
            placeholder="Enter password"
          />

          {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="mt-5 w-full rounded-[var(--radius-sm)] bg-[var(--amber-500)] text-[var(--ink-950)] font-semibold py-2.5 text-sm disabled:opacity-50 hover:bg-[var(--amber-400)] transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
