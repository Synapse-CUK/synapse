import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back to Synapse.">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </AuthShell>
  );
}
