import { MoreHorizontal, Eye, Pencil, Copy, UserCog, Flag, Download, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { StageMoveMenu } from "./StageMoveMenu"
import { OWNER_NAMES, avatarForOwnerName } from "@/data/opportunities"
import { downloadCsv, opportunitiesToCsv } from "@/lib/csv"
import { t } from "@/lib/i18n"
import { canEditOpportunity, useOpportunitiesStore, type Language } from "@/store/opportunities-store"
import type { Opportunity, Priority } from "@/data/types"

const PRIORITY_LABEL: Record<Priority, { en: string; ar: string }> = {
  high: { en: "High", ar: "مرتفعة" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
}

/**
 * Edit and Delete are surfaced as standalone icons (the two most frequent actions);
 * everything else — including the accessible "Move to" stage change — stays in the
 * "..." menu. Reused as-is by List rows, Cards and Kanban cards (spec §32/33).
 */
export function RowActionsMenu({
  opp,
  language,
  size = "icon-sm",
}: {
  opp: Opportunity
  language: Language
  size?: "icon-xs" | "icon-sm"
}) {
  const s = t(language)
  const { openDrawer, openEditForm, duplicateOpportunity, updateOwner, updatePriority, requestDelete } =
    useOpportunitiesStore()
  const editable = canEditOpportunity(opp)
  const iconSize = size === "icon-xs" ? "size-3.5" : "size-4"

  function stop(e: React.SyntheticEvent) {
    e.stopPropagation()
  }

  return (
    <div className="flex items-center" onClick={stop} onPointerDown={stop}>
      <Button
        variant="ghost"
        size={size}
        aria-label={`${s.edit} — ${opp.name}`}
        title={editable ? s.edit : s.permissionDenied(s.actionEditVerb)}
        disabled={!editable}
        onClick={() => openEditForm(opp.id)}
      >
        <Pencil className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size={size}
        aria-label={`${s.deleteAction} — ${opp.name}`}
        title={editable ? s.deleteAction : s.permissionDenied(s.actionDeleteVerb)}
        disabled={!editable}
        className="hover:bg-destructive/10 hover:text-destructive"
        onClick={() => requestDelete([opp.id])}
      >
        <Trash2 className={iconSize} />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={size} aria-label={s.moreActionsFor(opp.name)}>
            <MoreHorizontal className={iconSize} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={stop}>
          <DropdownMenuItem onSelect={() => openDrawer(opp.id)}>
            <Eye /> {s.view}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => duplicateOpportunity(opp.id)}>
            <Copy /> {s.duplicate}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <StageMoveMenu opp={opp} language={language} />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!editable}>
              <UserCog /> {s.changeOwner}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {OWNER_NAMES.map((name) => (
                <DropdownMenuItem
                  key={name}
                  disabled={name === opp.owner}
                  onSelect={() => updateOwner(opp.id, name)}
                >
                  <Avatar className="size-5">
                    <AvatarImage src={avatarForOwnerName(name)} alt="" />
                    <AvatarFallback className="text-[9px]">
                      {name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!editable}>
              <Flag /> {s.changePriority}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                <DropdownMenuItem
                  key={p}
                  disabled={p === opp.priority}
                  onSelect={() => updatePriority(opp.id, p)}
                >
                  {PRIORITY_LABEL[p][language]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => downloadCsv(`${opp.id}.csv`, opportunitiesToCsv([opp]))}>
            <Download /> {s.exportBtn}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
