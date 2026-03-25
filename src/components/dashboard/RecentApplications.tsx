"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Application {
  id: number;
  title: string;
  company: string;
  status: "pending" | "accepted" | "rejected" | "in-review";
  date: string;
}

const applications: Application[] = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp Inc.",
    status: "in-review",
    date: "2 days ago",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Creative Studio",
    status: "pending",
    date: "4 days ago",
  },
  {
    id: 3,
    title: "Full Stack Engineer",
    company: "StartUp X",
    status: "accepted",
    date: "1 week ago",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "accepted":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "in-review":
      return <Clock className="h-4 w-4 text-sky-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    accepted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    rejected: "bg-red-500/15 text-red-600 dark:text-red-300",
    "in-review": "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  };

  return (
    <Badge variant="secondary" className={variants[status]}>
      {status === "in-review" ? "In Review" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function RecentApplications() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Briefcase className="h-5 w-5 text-primary" />
          Recent Applications
        </CardTitle>
        <CardDescription>
          A quick look at where current submissions stand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4"
          >
            <div>
              <h4 className="font-medium">{app.title}</h4>
              <p className="text-sm text-muted-foreground">{app.company}</p>
              <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {getStatusIcon(app.status)}
              {getStatusBadge(app.status)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
