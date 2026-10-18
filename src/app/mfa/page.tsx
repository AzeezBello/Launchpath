import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import MfaChallengeForm from "@/components/auth/MfaChallengeForm";

export default function MfaPage() {
  return (
    <AuthShell
      eyebrow="One more step"
      title="Enter your verification code"
      description="Two-factor authentication is on for this account. Open your authenticator app and enter the current code."
      footer={
        <>
          Lost access to your app?{" "}
          <Link href="/contact" className="font-medium text-foreground hover:text-primary">
            Contact support
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
        <MfaChallengeForm />
      </Suspense>
    </AuthShell>
  );
}
