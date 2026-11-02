"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const dbUser = useQuery(api.users.current);

  useEffect(() => {
    // Skip guard on onboarding page itself or public sign-in/up routes
    if (
      pathname === "/onboarding" ||
      pathname?.startsWith("/sign-in") ||
      pathname?.startsWith("/sign-up")
    ) {
      return;
    }

    // Signed in with no Convex record yet (the Clerk webhook hasn't run or
    // failed). Onboarding creates the record, so send them there.
    if (isAuthenticated && dbUser === null) {
      router.push("/onboarding");
      return;
    }

    if (dbUser) {
      // If user has not completed academic registration info, redirect to /onboarding
      const isMissingAcademicInfo = !dbUser.registrationNumber || !dbUser.admissionYear;
      if (isMissingAcademicInfo) {
        router.push("/onboarding");
      }
    }
  }, [dbUser, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
