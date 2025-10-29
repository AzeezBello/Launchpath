"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

export function ResumeScoreCard() {
  // For demo, let's animate the score
  const [score, setScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setScore(78) // Example score
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resume Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-4xl font-bold text-primary">{score}%</div>
        <Progress value={score} className="h-2" />
        <p className="text-sm mt-3 text-muted-foreground">
          A strong resume increases your chances of landing interviews.
        </p>
      </CardContent>
    </Card>
  )
}
