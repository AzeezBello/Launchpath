"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react"

interface Application {
  id: number
  title: string
  company: string
  status: "pending" | "accepted" | "rejected" | "in-review"
  date: string
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
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "accepted":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-500" />
    case "in-review":
      return <Clock className="w-4 h-4 text-blue-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-400" />
  }
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    "in-review": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  }

  return (
    <Badge variant="secondary" className={variants[status]}>
      {status === "in-review" ? "In Review" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function RecentApplications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Recent Applications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex justify-between items-center border-b last:border-none pb-3"
          >
            <div>
              <h4 className="font-medium">{app.title}</h4>
              <p className="text-sm text-muted-foreground">{app.company}</p>
              <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(app.status)}
              {getStatusBadge(app.status)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
