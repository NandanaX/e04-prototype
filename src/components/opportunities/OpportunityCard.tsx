import { Calendar, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency, formatDate } from "@/lib/i18n"
import { STAGE_MAP, type Opportunity } from "@/data/types"
import { useOpportunitiesStore, type Language } from "@/store/opportunities-store"
import { PriorityBadge, StageBadge } from "./badges"
import { RowActionsMenu } from "./RowActionsMenu"
import { cn } from "@/lib/utils"

interface Props {
  opp: Opportunity
  language: Language
  selected: boolean
  onToggleSelect: () => void
  /** Compact mode drops the next-step line — used inside Kanban columns. */
  density?: "comfortable" | "compact"
  /** Kanban already conveys stage via the column, so it hides the (redundant) stage badge. */
  showStage?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  className?: string
}

export function OpportunityCard({
  opp,
  language,
  selected,
  onToggleSelect,
  density = "comfortable",
  showStage = true,
  dragHandleProps,
  className,
}: Props) {
  const openDrawer = useOpportunitiesStore((s) => s.openDrawer)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => openDrawer(opp.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          openDrawer(opp.id)
        }
      }}
      className={cn(
        "group gap-3 py-3 outline-none transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-hover active:translate-y-0 active:bg-accent/40 active:shadow-card focus-visible:ring-2 focus-visible:ring-ring",
        selected && "ring-2 ring-ring",
        className
      )}
      {...dragHandleProps}
    >
      <CardContent className="flex flex-col gap-2.5 px-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${opp.name}`}
              className="mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium leading-tight">{opp.name}</div>
              <div className="truncate text-xs text-muted-foreground">{opp.account}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <PriorityBadge priority={opp.priority} language={language} />
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <RowActionsMenu opp={opp} language={language} size="icon-xs" />
            </div>
          </div>
        </div>

        {showStage && (
          <div>
            <StageBadge stage={STAGE_MAP[opp.stage]} language={language} />
          </div>
        )}

        <div className="flex items-baseline gap-1.5 whitespace-nowrap text-base font-semibold tabular-nums">
          {formatCurrency(opp.amount, language)}
          <span className="text-xs font-normal text-muted-foreground">{opp.probability}%</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDate(opp.closeDate, language)}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            <Avatar className="size-5">
              <AvatarImage src={opp.ownerAvatar} alt="" />
              <AvatarFallback className="text-[9px]">{opp.ownerInitials}</AvatarFallback>
            </Avatar>
          </span>
        </div>

        {density === "comfortable" && opp.nextStep !== "—" && (
          <div className="truncate rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {opp.nextStep}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
