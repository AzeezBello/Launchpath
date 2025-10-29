"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResumePage() {
  // Sample static data — replace with real data from API or DB
  const resumes = [
    { id: "1", title: "Frontend Developer Resume" },
    { id: "2", title: "Product Designer Resume" },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Resumes</h1>
        <Link href="/dashboard/resume/new">
          <Button>Create New Resume</Button>
        </Link>
      </div>

      {resumes.map((resume) => (
        <Card key={resume.id}>
          <CardHeader>
            <CardTitle>{resume.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <Link href={`/dashboard/resume/${resume.id}`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="destructive">Delete</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
