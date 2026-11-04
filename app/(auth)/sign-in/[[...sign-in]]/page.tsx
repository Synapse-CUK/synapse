import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import DevQuickSignIn from "@/components/DevQuickSignIn";

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back to Synapse.">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      {/* Compiled out of production builds. */}
      {process.env.NODE_ENV === "development" && <DevQuickSignIn />}
    </AuthShell>
  );
}
