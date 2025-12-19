"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  profile: { name: "", email: "", company: "Viral Ad Media" },
  integrations: { meta_token: "", tiktok_token: "", google_refresh: "" },
  security: { twofa: false, session_alerts: false },
  appearance: { theme: "light", accent: "indigo" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings({ ...DEFAULTS, ...data });
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

      if (!res.ok) throw new Error("Failed to update settings");
      const data = await res.json();
      setSettings(data);
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
      <div className="p-6 text-sm text-gray-300">
        Loading your settings...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <Button onClick={save} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
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

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Theme</p>
              <Select
                value={settings.appearance.theme}
                onValueChange={(val: Settings["appearance"]["theme"]) =>
                  update("appearance", "theme", val)
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10">
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
              <p className="text-sm text-gray-300">Accent</p>
              <Select
                value={settings.appearance.accent}
                onValueChange={(val: Settings["appearance"]["accent"]) =>
                  update("appearance", "accent", val)
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10">
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

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!settings.security.twofa}
                onChange={(e) => update("security", "twofa", e.target.checked)}
                className="h-4 w-4 rounded border-white/40 bg-transparent"
              />
              Enable 2FA (demo)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!settings.security.session_alerts}
                onChange={(e) => update("security", "session_alerts", e.target.checked)}
                className="h-4 w-4 rounded border-white/40 bg-transparent"
              />
              Session alerts
            </label>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
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
