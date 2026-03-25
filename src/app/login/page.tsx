import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      description="Jump back into your pipeline, saved drafts, and active opportunities."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground hover:text-primary">
            Create one
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
