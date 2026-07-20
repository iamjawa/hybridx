import Link from "next/link"
import { Target, ArrowUp, ArrowDown } from "lucide-react"

interface GoalMatchCardProps {
  goalName: string
  goalId: string
  overallScore: number
  breakdown?: { traitName: string; score: number }[]
}

export function GoalMatchCard({ goalName, goalId, overallScore, breakdown }: GoalMatchCardProps) {
  const scoreColor = overallScore >= 80 ? "text-emerald-500" : overallScore >= 60 ? "text-blue-500" : overallScore >= 40 ? "text-amber-500" : "text-red-500"
  const scoreBg = overallScore >= 80 ? "bg-emerald-500/10" : overallScore >= 60 ? "bg-blue-500/10" : overallScore >= 40 ? "bg-amber-500/10" : "bg-red-500/10"

  return (
    <Link href={`/goals/${goalId}`}>
      <div className="rounded-xl border p-4 space-y-3 hover:border-muted-foreground/30 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <span className="text-sm font-medium">{goalName}</span>
          </div>
          <div className={`flex size-10 items-center justify-center rounded-full ${scoreBg}`}>
            <span className={`text-sm font-semibold ${scoreColor}`}>{overallScore}%</span>
          </div>
        </div>
        {breakdown && breakdown.length > 0 && (
          <div className="space-y-1">
            {breakdown.slice(0, 4).map((b, i) => {
              const isStrong = b.score >= 70
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    {isStrong ? <ArrowUp className="size-3 text-emerald-500" /> : <ArrowDown className="size-3 text-red-500" />}
                    {b.traitName}
                  </span>
                  <span className={isStrong ? "text-emerald-500" : "text-red-500"}>{b.score}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Link>
  )
}
