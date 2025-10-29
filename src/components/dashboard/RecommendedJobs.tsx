"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin } from "lucide-react"

interface Job {
  id: number
  title: string
  company: string
  location: string
  matchScore: number
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
]

export function RecommendedJobs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Recommended Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex justify-between items-start border-b last:border-none pb-3"
          >
            <div>
              <h4 className="font-medium">{job.title}</h4>
              <p className="text-sm text-muted-foreground">{job.company}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {job.matchScore}% Match
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
