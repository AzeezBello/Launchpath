"use client";

import { useState } from "react";
import { Mail, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <section className="space-y-4">
        <Badge variant="outline" className="w-fit">
          <Mail className="h-3.5 w-3.5" />
          Contact
        </Badge>
        <h1 className="text-balance text-4xl font-semibold sm:text-5xl">
          Let&apos;s talk about the workflow you want LaunchPath to support.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Use this page to share product questions, feedback, or team needs. Right now
          the form shows a confirmation toast, which makes it easy to connect to a
          real support inbox or CRM next.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquareText className="h-5 w-5 text-primary" />
              What to send
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Questions about pricing or rollout plans.</p>
            <p>Feedback on scholarships, jobs, grants, or admissions workflows.</p>
            <p>Ideas for integrations, exports, or team collaboration.</p>
          </CardContent>
        </Card>
      </section>

      <Card className="surface-panel border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Send a note</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
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

            <Button type="submit">Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
