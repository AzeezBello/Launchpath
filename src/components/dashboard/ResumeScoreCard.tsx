"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ResumeScoreCard() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScore(78);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5 text-primary" />
          Resume Score
        </CardTitle>
        <CardDescription>
          A quick quality signal based on the current resume draft.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-4xl font-bold text-primary">{score}%</div>
        <Progress value={score} className="h-2" />
        <p className="mt-3 text-sm text-muted-foreground">
          Strong formatting, clear outcomes, and role-specific language increase your odds of getting interviews.
        </p>
      </CardContent>
    </Card>
  );
}
