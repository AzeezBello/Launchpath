"use client";

import { useEffect, useState } from "react";
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

type Settings = {
  profile: { name?: string; email?: string; company?: string };
  integrations: { meta_token?: string; tiktok_token?: string; google_refresh?: string };
  security: { twofa?: boolean; session_alerts?: boolean };
  appearance: {
    theme?: "light" | "dark" | "system";
    accent?: "violet" | "indigo" | "fuchsia" | "emerald" | "cyan";
  };
};

const DEFAULTS: Settings = {
  profile: { name: "", email: "", company: "" },
  integrations: { meta_token: "", tiktok_token: "", google_refresh: "" },
  security: { twofa: false, session_alerts: false },
  appearance: { theme: "light", accent: "indigo" },
};

function normalizeSettings(input: unknown): Settings {
  const source = (input || {}) as Partial<Settings>;
  return {
    profile: { ...DEFAULTS.profile, ...(source.profile || {}) },
    integrations: { ...DEFAULTS.integrations, ...(source.integrations || {}) },
    security: { ...DEFAULTS.security, ...(source.security || {}) },
    appearance: { ...DEFAULTS.appearance, ...(source.appearance || {}) },
  };
}

export default function SettingsPage() {
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
      setSettings(normalizeSettings(payload?.data ?? payload));
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
        description="Manage your profile, appearance, security, and integrations."
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
            <CardDescription>Basic account details shown across the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Full name"
              value={settings.profile.name || ""}
              onChange={(e) => update("profile", "name", e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={settings.profile.email || ""}
              onChange={(e) => update("profile", "email", e.target.value)}
            />
            <Input
              placeholder="Company"
              value={settings.profile.company || ""}
              onChange={(e) => update("profile", "company", e.target.value)}
            />
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
                onValueChange={(val) => update("appearance", "theme", val as Settings["appearance"]["theme"])}
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
            <div className="space-y-2">
              <Label>Accent</Label>
              <Select
                value={settings.appearance.accent}
                onValueChange={(val) => update("appearance", "accent", val as Settings["appearance"]["accent"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Accent color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="violet">Violet</SelectItem>
                  <SelectItem value="indigo">Indigo</SelectItem>
                  <SelectItem value="fuchsia">Fuchsia</SelectItem>
                  <SelectItem value="emerald">Emerald</SelectItem>
                  <SelectItem value="cyan">Cyan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Keep your account protected.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={!!settings.security.twofa}
                onChange={(e) => update("security", "twofa", e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Enable 2FA
            </label>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={!!settings.security.session_alerts}
                onChange={(e) => update("security", "session_alerts", e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Session alerts
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect external accounts and services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Meta token"
              value={settings.integrations.meta_token || ""}
              onChange={(e) => update("integrations", "meta_token", e.target.value)}
            />
            <Input
              placeholder="TikTok token"
              value={settings.integrations.tiktok_token || ""}
              onChange={(e) => update("integrations", "tiktok_token", e.target.value)}
            />
            <Input
              placeholder="Google refresh token"
              value={settings.integrations.google_refresh || ""}
              onChange={(e) => update("integrations", "google_refresh", e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
