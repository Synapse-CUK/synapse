"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { StatusScreen } from "@/components/ui";

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
    <StatusScreen
      icon={<Icons.Warning className="h-7 w-7" />}
      title="Something went wrong"
      action={
        <>
          <button onClick={reset} className="btn-secondary">
            Try again
          </button>
          <Link href="/feed" className="btn-primary">
            Back to feed
          </Link>
        </>
      }
    >
      This page couldn&apos;t load. The link may be wrong, or the item may have been removed.
    </StatusScreen>
  );
}
