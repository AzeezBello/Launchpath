// src/app/dashboard/cover-letter/components/LetterCard.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type CoverLetter = {
  id: string;
  company_name?: string;
  position?: string;
  content?: string;
  created_at?: string;
};

export default function LetterCard({ letter }: { letter: CoverLetter }) {
  const createdAt = letter.created_at ? new Date(letter.created_at) : null;

  return (
    <Card className="hover-card h-full">
      <CardHeader>
        <CardTitle className="text-lg">{letter.position || "Cover Letter"}</CardTitle>
        <CardDescription>{letter.company_name}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {createdAt ? createdAt.toLocaleString() : "Saved draft"}
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/dashboard/cover-letter/${letter.id}`}>
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
