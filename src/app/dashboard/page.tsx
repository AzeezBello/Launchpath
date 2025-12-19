"use client"

import { Card, CardContent } from "@/components/ui/card"
import { scholarshipData, grantData, jobData, admissionData } from "@/data/opportunities"

export default function OverviewPage() {
  const stats = [
    { title: "Scholarships live", value: scholarshipData.length, color: "emerald" },
    { title: "Grants tracked", value: grantData.length, color: "indigo" },
    { title: "Jobs curated", value: jobData.length, color: "rose" },
    { title: "Admissions programs", value: admissionData.length, color: "cyan" },
  ]
  const colorMap: Record<string, { border: string; text: string }> = {
    emerald: { border: "border-emerald-500/30", text: "text-emerald-400" },
    indigo: { border: "border-indigo-500/30", text: "text-indigo-400" },
    rose: { border: "border-rose-500/30", text: "text-rose-400" },
    cyan: { border: "border-cyan-500/30", text: "text-cyan-300" },
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s) => (
        <Card
          key={s.title}
          className={`glass-panel hover-card text-white ${colorMap[s.color]?.border ?? "border-white/20"}`}
        >
          <CardContent className="p-6">
            <h3 className="text-sm uppercase tracking-wide text-gray-300">
              {s.title}
            </h3>
            <p className={`text-3xl font-bold mt-2 ${colorMap[s.color]?.text ?? "text-white"}`}>
              {s.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
