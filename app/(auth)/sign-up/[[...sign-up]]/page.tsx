import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell title="Join your campus network.">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </AuthShell>
  );
}
