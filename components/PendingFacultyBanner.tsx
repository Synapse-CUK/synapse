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
    <div className="border-b border-gold/30 bg-gold-tint">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-sm text-gold-ink sm:px-6">
        <Icons.Hourglass className="h-4 w-4 shrink-0" />
        <p>
          <span className="font-semibold">Faculty access is waiting for coordinator approval.</span>{" "}
          <span className="text-body">You can browse the feed and projects until then.</span>
        </p>
      </div>
    </div>
  );
}
