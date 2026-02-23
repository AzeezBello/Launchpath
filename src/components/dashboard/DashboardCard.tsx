import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle?: string
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </CardContent>
    </Card>
  )
}
