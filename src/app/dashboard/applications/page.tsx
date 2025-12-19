"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type Application = {
  id: string;
  program: string;
  status: string;
  date: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setApplications(d.results || []));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📄 My Applications</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <h3 className="font-semibold">{app.program}</h3>
            </CardHeader>
            <CardContent>
              <p>Status: {app.status}</p>
              <p className="text-sm text-muted-foreground">Date: {app.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
