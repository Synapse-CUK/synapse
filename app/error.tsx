"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="text-slate-500">
        This page couldn&apos;t load. The link may be wrong, or the item may have been removed.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-teal-500 transition"
        >
          Try again
        </button>
        <Link
          href="/feed"
          className="px-6 py-3 gradient-teal text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}
