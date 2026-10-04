import { Users, Clock, CheckCircle2, XCircle, type LucideIcon } from "lucide-react"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"
import { cn } from "@/lib/utils"

function StatCard({
  icon: Icon,
  tint,
  label,
  value,
  index,
}: {
  icon: LucideIcon
  tint: string
  label: string
  value: number
  index: number
}) {
  return (
    <div
      className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card animate-fade-up-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-hover"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tint)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-2xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">{value}</div>
      </div>
    </div>
  )
}

export function StatsCards() {
  const { opportunities, language } = useOpportunitiesStore()
  const s = t(language)

  const total = opportunities.length
  const won = opportunities.filter((o) => o.stage === "hired").length
  const lost = opportunities.filter((o) => o.stage === "rejected").length
  const open = total - won - lost

  return (
    <div className="flex flex-wrap gap-3 px-6 pt-6">
      <StatCard index={0} icon={Users} tint="bg-info/10 text-info" label={s.statTotal} value={total} />
      <StatCard index={1} icon={Clock} tint="bg-warning/10 text-warning" label={s.statOpen} value={open} />
      <StatCard index={2} icon={CheckCircle2} tint="bg-success/10 text-success" label={s.statWon} value={won} />
      <StatCard index={3} icon={XCircle} tint="bg-destructive/10 text-destructive" label={s.statLost} value={lost} />
    </div>
  )
}
