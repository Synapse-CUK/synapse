"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "./Icons";

export default function PendingFacultyBanner() {
  const dbUser = useQuery(api.users.current);

  if (!dbUser || dbUser.role !== "faculty_pending") {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-b border-amber-200/80 bg-amber-50/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 text-xs font-medium text-amber-900">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-mono text-[10px] border border-amber-300/60">
              Faculty Verification Pending
            </span>
            <span>
              Your faculty registration request is awaiting department coordinator approval. You currently have full student functionality.
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-700/80 font-semibold shrink-0">
          <Icons.Sparkles className="w-3.5 h-3.5" />
          <span>Supervisors will review your details shortly</span>
        </div>
      </div>
    </div>
  );
}
