"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function OverviewPage() {
  const stats = [
    { title: "Applications Submitted", value: "24", color: "emerald" },
    { title: "Scholarships Awarded", value: "3", color: "indigo" },
    { title: "Pending Reviews", value: "5", color: "rose" },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((s) => (
        <Card
          key={s.title}
          className={`glass-panel hover-card border-${s.color}-500/30 text-white`}
        >
          <CardContent className="p-6">
            <h3 className="text-sm uppercase tracking-wide text-gray-300">
              {s.title}
            </h3>
            <p className={`text-3xl font-bold text-${s.color}-400 mt-2`}>
              {s.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
