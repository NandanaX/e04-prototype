import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"
import { cn } from "@/lib/utils"

function StatCard({
  dotClassName,
  label,
  value,
  index,
}: {
  dotClassName: string
  label: string
  value: number
  index: number
}) {
  return (
    <div
      className="flex-1 rounded-lg border border-border bg-card px-4 py-4 shadow-card animate-fade-up-sm transition-shadow hover:shadow-hover"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
        <span className={cn("size-1.5 rounded-full", dotClassName)} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  )
}

export function StatsCards() {
  const { opportunities, language } = useOpportunitiesStore()
  const s = t(language)

  const total = opportunities.length
  const won = opportunities.filter((o) => o.stage === "closed-won").length
  const lost = opportunities.filter((o) => o.stage === "closed-lost").length
  const open = total - won - lost

  return (
    <div className="flex flex-wrap gap-3 px-6 pt-6">
      <StatCard index={0} dotClassName="bg-info" label={s.statTotal} value={total} />
      <StatCard index={1} dotClassName="bg-warning" label={s.statOpen} value={open} />
      <StatCard index={2} dotClassName="bg-success" label={s.statWon} value={won} />
      <StatCard index={3} dotClassName="bg-destructive" label={s.statLost} value={lost} />
    </div>
  )
}
