import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { STAGES, type Opportunity } from "@/data/types"
import { canEditOpportunity, useOpportunitiesStore, type Language } from "@/store/opportunities-store"
import { t } from "@/lib/i18n"

/**
 * The accessible, keyboard-reachable alternative to dragging a Kanban card.
 * Runs through the exact same `attemptMoveStage` validation as drag/drop —
 * a rejected transition here shows the same dialog a rejected drop would.
 */
export function StageMoveMenu({ opp, language }: { opp: Opportunity; language: Language }) {
  const attemptMoveStage = useOpportunitiesStore((s) => s.attemptMoveStage)
  const s = t(language)
  const isClosed = opp.stage === "hired" || opp.stage === "rejected"
  const disabled = isClosed || !canEditOpportunity(opp)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={disabled}>{s.moveTo}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {STAGES.map((stage) => (
          <DropdownMenuItem
            key={stage.id}
            disabled={stage.id === opp.stage}
            onSelect={() => attemptMoveStage(opp.id, stage.id)}
          >
            {language === "ar" ? stage.labelAr : stage.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
