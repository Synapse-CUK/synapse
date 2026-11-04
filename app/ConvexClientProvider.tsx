"use client";

import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl);

// Hex values mirror the tokens in app/globals.css.
const clerkColors = {
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

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          ...clerkColors,
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
