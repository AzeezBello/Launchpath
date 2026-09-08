"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LockKeyhole } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/providers/SupabaseProvider";

const MIN_LENGTH = 8;

export function PasswordCard() {
  const { supabase, user } = useSupabase();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  // Google-only accounts have no password to change; Supabase reports the
  // sign-in providers on the user's identities.
  const hasPasswordIdentity =
    !user?.identities || user.identities.length === 0 || user.identities.some((i) => i.provider === "email");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      toast.error(`Use at least ${MIN_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      setPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          {hasPasswordIdentity
            ? "Choose a new password for signing in with email."
            : "You sign in with Google, so there is no password to manage here."}
        </CardDescription>
      </CardHeader>
      {hasPasswordIdentity && (
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pw-new">New password</Label>
              <Input
                id="pw-new"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-confirm">Confirm new password</Label>
              <Input
                id="pw-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" disabled={saving || !password}>
              <LockKeyhole className="h-4 w-4" />
              {saving ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
