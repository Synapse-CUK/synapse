"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Icons } from "./Icons";
import { Spinner } from "./ui";

const ROLES = [
  { id: "student", label: "Student", icon: Icons.Student },
  { id: "faculty", label: "Faculty", icon: Icons.Faculty },
  { id: "coordinator", label: "Coordinator", icon: Icons.Crown },
] as const;

type Role = (typeof ROLES)[number]["id"];

/**
 * One-click sign-in as the qa01 test accounts. Only rendered by `next dev`;
 * see app/api/dev-login/route.ts. To switch accounts, sign out first.
 */
function DevQuickSignIn() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [busy, setBusy] = useState<Role | null>(null);
  const [error, setError] = useState("");

  async function signInAs(role: Role) {
    if (!isLoaded) return;
    setBusy(role);
    setError("");
    try {
      const res = await fetch("/api/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json().catch(() => ({}))) as { ticket?: string; error?: string };
      if (!res.ok || !data.ticket) throw new Error(data.error || `Dev login failed (${res.status}).`);

      const attempt = await signIn.create({ strategy: "ticket", ticket: data.ticket });
      if (attempt.status !== "complete" || !attempt.createdSessionId) {
        throw new Error(`Sign-in did not complete (${attempt.status}).`);
      }
      await setActive({ session: attempt.createdSessionId });
      router.push("/feed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Dev login failed.");
      setBusy(null);
    }
  }

  return (
    <section className="mt-6 w-full rounded-2xl border border-dashed border-gold/50 bg-gold-tint/60 p-4">
      <p className="label-caps text-gold-ink">Dev only: test accounts</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => signInAs(r.id)}
            disabled={busy !== null || !isLoaded}
            className="btn-secondary btn-sm"
          >
            {busy === r.id ? <Spinner /> : <r.icon className="h-4 w-4" />}
            {r.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
    </section>
  );
}

// Production builds get an empty component, so the code above is dropped from the bundle.
export default process.env.NODE_ENV === "development" ? DevQuickSignIn : () => null;
