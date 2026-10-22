"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message captured. Connect this form to your inbox or CRM when you're ready.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="grid gap-10 py-2 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <section className="space-y-6">
        <Badge variant="outline" className="w-fit">
          <Mail className="size-3.5 text-primary" />
          Contact &amp; Partnerships
        </Badge>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Let&apos;s talk about the workflow you want LaunchPath to support.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Share product questions, university or fellowship partnerships, or cohort
          onboarding needs.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareText className="size-4 text-primary" />
              What to send
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
            <p>Questions about Pro or Team plans and campus rollouts.</p>
            <p>Feedback on scholarships, jobs, grants, or admissions workflows.</p>
            <p>Ideas for custom integrations, exports, or advisor collaboration.</p>
          </CardContent>
        </Card>

        <div className="mockup-frame overflow-hidden p-2">
          <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950">
            <Image
              src="/images/pipeline-analytics.svg"
              alt="LaunchPath deadline radar and velocity preview"
              width={640}
              height={440}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      <Card className="p-2 sm:p-4">
        <CardHeader>
          <CardTitle className="text-xl">Send a note</CardTitle>
          <CardDescription>
            We review every message from applicants, fellowship directors, and career teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Tell us what you're trying to improve, launch, or simplify."
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Send className="size-4" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
