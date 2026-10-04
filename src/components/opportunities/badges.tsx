import { Badge } from "@/components/ui/badge"
import type { Priority, StageDef } from "@/data/types"
import type { Language } from "@/store/opportunities-store"

export function PriorityBadge({ priority, language }: { priority: Priority; language: Language }) {
  const label =
    language === "ar"
      ? { high: "مرتفعة", medium: "متوسطة", low: "منخفضة" }[priority]
      : { high: "High", medium: "Medium", low: "Low" }[priority]
  const className =
    priority === "high"
      ? "bg-destructive/10 text-destructive"
      : priority === "medium"
        ? "bg-warning/10 text-warning"
        : "bg-muted text-muted-foreground"
  return <Badge className={className}>{label}</Badge>
}

export function StageBadge({ stage, language }: { stage: StageDef; language: Language }) {
  const className = stage.closed
    ? stage.id === "hired"
      ? "bg-success/10 text-success"
      : "bg-destructive/10 text-destructive"
    : "bg-info/10 text-info"
  return (
    <Badge className={className}>
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      {language === "ar" ? stage.labelAr : stage.label}
    </Badge>
  )
}
