"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalInfo } from "@/types/resume";

type Props = {
  initialData?: PersonalInfo;
  onChange?: (value: PersonalInfo) => void;
};

const EMPTY: PersonalInfo = { name: "", email: "", phone: "", summary: "" };

export default function PersonalInfoForm({ onChange, initialData }: Props) {
  const [info, setInfo] = useState<PersonalInfo>(initialData || EMPTY);

  // Re-sync only when the parent hands us a different object (e.g. after load).
  useEffect(() => {
    setInfo(initialData || EMPTY);
  }, [initialData]);

  const update = (patch: Partial<PersonalInfo>) => {
    const next = { ...info, ...patch };
    setInfo(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold">Personal information</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pi-name">Full name</Label>
          <Input
            id="pi-name"
            placeholder="Ada Lovelace"
            value={info.name}
            onChange={(e) => update({ name: e.target.value })}
            autoComplete="name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pi-email">Email</Label>
          <Input
            id="pi-email"
            type="email"
            placeholder="you@example.com"
            value={info.email}
            onChange={(e) => update({ email: e.target.value })}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pi-phone">Phone</Label>
        <Input
          id="pi-phone"
          type="tel"
          placeholder="+1 555 000 0000"
          value={info.phone || ""}
          onChange={(e) => update({ phone: e.target.value })}
          autoComplete="tel"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pi-summary">Professional summary</Label>
        <Textarea
          id="pi-summary"
          rows={4}
          placeholder="Two or three sentences on who you are, what you have done, and what you are looking for."
          value={info.summary || ""}
          onChange={(e) => update({ summary: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Used by the resume score, job matching, and the cover letter generator.
        </p>
      </div>
    </div>
  );
}
