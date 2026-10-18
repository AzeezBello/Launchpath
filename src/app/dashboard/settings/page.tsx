"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TwoFactorCard } from "@/components/settings/TwoFactorCard";
import { PasswordCard } from "@/components/settings/PasswordCard";
import { BillingCard } from "@/components/settings/BillingCard";
import { useTheme } from "next-themes";

type Focus = "scholarship" | "grant" | "job" | "admission";

type Settings = {
  profile: { name?: string; email?: string; company?: string };
  security: { session_alerts?: boolean };
  appearance: { theme?: "light" | "dark" | "system" };
  onboarding: { focus?: Focus[] };
  notifications: { deadlineReminders?: boolean };
};

const DEFAULTS: Settings = {
  profile: { name: "", email: "", company: "" },
  security: { session_alerts: false },
  appearance: { theme: "system" },
  onboarding: { focus: [] },
  notifications: { deadlineReminders: true },
};

const FOCUS_OPTIONS: { value: Focus; label: string }[] = [
  { value: "scholarship", label: "Scholarships" },
  { value: "grant", label: "Grants" },
  { value: "job", label: "Jobs" },
  { value: "admission", label: "Admissions" },
];

function normalizeSettings(input: unknown): Settings {
  const source = (input || {}) as Partial<Settings>;
  return {
    profile: { ...DEFAULTS.profile, ...(source.profile || {}) },
    security: { ...DEFAULTS.security, ...(source.security || {}) },
    appearance: { ...DEFAULTS.appearance, ...(source.appearance || {}) },
    onboarding: { focus: Array.isArray(source.onboarding?.focus) ? source.onboarding.focus : [] },
    notifications: { ...DEFAULTS.notifications, ...(source.notifications || {}) },
  };
}

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load settings");
        setSettings(normalizeSettings(payload?.data ?? payload));
      } catch (error) {
        console.error(error);
        toast.error("Could not load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = <K extends keyof Settings, T extends keyof Settings[K]>(
    section: K,
    key: T,
    value: Settings[K][T]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const toggleFocus = (value: Focus) => {
    const current = settings.onboarding.focus || [];
    update(
      "onboarding",
      "focus",
      current.includes(value) ? current.filter((f) => f !== value) : [...current, value]
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to update settings");
      const next = normalizeSettings(payload?.data ?? payload);
      setSettings(next);
      // The theme preference is stored server-side and applied here so it
      // actually changes what the user sees.
      if (next.appearance.theme) setTheme(next.appearance.theme);
      toast.success("Settings updated");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-14 w-72" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Manage your profile, focus, appearance, and account security."
        action={
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your name signs generated cover letters when no resume is attached.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                placeholder="Full name"
                value={settings.profile.name || ""}
                onChange={(e) => update("profile", "name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Contact email</Label>
              <Input
                id="profile-email"
                placeholder="Email"
                type="email"
                value={settings.profile.email || ""}
                onChange={(e) => update("profile", "email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-company">School or company</Label>
              <Input
                id="profile-company"
                placeholder="School or company"
                value={settings.profile.company || ""}
                onChange={(e) => update("profile", "company", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus</CardTitle>
            <CardDescription>
              What you are working toward. These lead your overview and recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map((option) => {
                const selected = (settings.onboarding.focus || []).includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleFocus(option.value)}
                    className={
                      selected
                        ? "rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
                        : "rounded-2xl border border-border/80 bg-background/45 px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary/25 hover:text-foreground"
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how LaunchPath looks for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.appearance.theme}
                onValueChange={(val) => {
                  const theme = val as Settings["appearance"]["theme"];
                  update("appearance", "theme", theme);
                  if (theme) setTheme(theme);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Email reminders and account alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                checked={settings.notifications.deadlineReminders !== false}
                onChange={(e) => update("notifications", "deadlineReminders", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              <span>
                Deadline reminders
                <span className="block text-xs text-muted-foreground">
                  One email when an open application is 7, 3, and 1 days from its deadline, and on the day.
                </span>
              </span>
            </label>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={!!settings.security.session_alerts}
                onChange={(e) => update("security", "session_alerts", e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Email me when a new device signs in
            </label>
          </CardContent>
        </Card>

        <TwoFactorCard />
        <PasswordCard />
        <Suspense fallback={null}>
          <BillingCard />
        </Suspense>
      </div>
    </div>
  );
}
