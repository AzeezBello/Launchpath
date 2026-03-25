import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Create account"
      title="Start your LaunchPath workspace"
      description="Set up your account and get a cleaner home for applications, drafts, and opportunity tracking."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:text-primary">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
