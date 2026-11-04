"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl);

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToScheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Follows the OS colour scheme so Clerk's sign-in and account UI match the app. */
function usePrefersDark() {
  return useSyncExternalStore(
    subscribeToScheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

// Hex values mirror the tokens in app/globals.css.
const clerkLight = {
  colorPrimary: "#0b1f3a",
  colorTextOnPrimaryBackground: "#fdfdfe",
  colorBackground: "#fdfdfe",
  colorInputBackground: "#fdfdfe",
  colorText: "#0b1f3a",
  colorTextSecondary: "#5c6a80",
  colorInputText: "#0b1f3a",
  colorNeutral: "#0b1f3a",
  colorDanger: "#b22234",
  colorSuccess: "#157652",
};

const clerkDark = {
  colorPrimary: "#e9b86c",
  colorTextOnPrimaryBackground: "#0b1f3a",
  colorBackground: "#0b1729",
  colorInputBackground: "#101f36",
  colorText: "#ecf1f8",
  colorTextSecondary: "#909fb6",
  colorInputText: "#ecf1f8",
  colorNeutral: "#ecf1f8",
  colorDanger: "#f2808c",
  colorSuccess: "#56c796",
};

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const prefersDark = usePrefersDark();

  return (
    <ClerkProvider
      appearance={{
        variables: {
          ...(prefersDark ? clerkDark : clerkLight),
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "shadow-none",
          rootBox: "w-full",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
