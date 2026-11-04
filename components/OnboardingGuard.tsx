"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { needsOnboarding } from "@/convex/lib/roles";

/**
 * Makes sure every signed-in user has a Convex record, and sends students who
 * haven't given their academic details to /onboarding. Faculty, pending
 * faculty and coordinators are never sent there.
 */
export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const dbUser = useQuery(api.users.current);
  const ensureUser = useMutation(api.users.ensureUser);
  const ensuring = useRef(false);

  useEffect(() => {
    // No record yet: the Clerk webhook hasn't run, or the query result is from
    // before sign-in. ensureUser is idempotent, so a stale null is harmless.
    if (isAuthenticated && dbUser === null && !ensuring.current) {
      ensuring.current = true;
      ensureUser()
        .catch((err) => console.error("Couldn't create your Synapse profile:", err))
        .finally(() => {
          ensuring.current = false;
        });
    }
  }, [dbUser, isAuthenticated, ensureUser]);

  useEffect(() => {
    if (pathname === "/onboarding" || pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
      return;
    }
    if (isAuthenticated && dbUser && needsOnboarding(dbUser)) {
      router.replace("/onboarding");
    }
  }, [dbUser, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
