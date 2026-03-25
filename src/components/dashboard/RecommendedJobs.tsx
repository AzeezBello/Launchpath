"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  matchScore: number;
}

const jobs: Job[] = [
  {
    id: 1,
    title: "React Developer",
    company: "NextGen Labs",
    location: "Remote",
    matchScore: 92,
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Designify",
    location: "San Francisco, CA",
    matchScore: 88,
  },
  {
    id: 3,
    title: "Full Stack Engineer",
    company: "TechNova",
    location: "Hybrid - NYC",
    matchScore: 85,
  },
];

export function RecommendedJobs() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          Recommended Jobs
        </CardTitle>
        <CardDescription>
          Curated roles with strong profile alignment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4"
          >
            <div>
              <h4 className="font-medium">{job.title}</h4>
              <p className="text-sm text-muted-foreground">{job.company}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-sky-500/15 text-sky-600 dark:text-sky-300"
            >
              {job.matchScore}% Match
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
