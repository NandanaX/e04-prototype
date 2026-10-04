import { UserCog, Flag, GitBranch, Download, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { STAGES, type Priority } from "@/data/types"
import { OWNER_NAMES, avatarForOwnerName } from "@/data/opportunities"
import { downloadCsv, opportunitiesToCsv } from "@/lib/csv"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"

const PRIORITY_LABEL: Record<Priority, { en: string; ar: string }> = {
  high: { en: "High", ar: "مرتفعة" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
}

/**
 * Selection persists by record id across every view switch (framework rule).
 * Renders as a floating pill anchored to the bottom-center of the table
 * panel so it never displaces the header chrome above it.
 */
export function SelectionBar() {
  const {
    language,
    selectedIds,
    clearSelection,
    opportunities,
    bulkUpdateOwner,
    bulkUpdatePriority,
    bulkChangeStage,
    requestDelete,
  } = useOpportunitiesStore()
  const s = t(language)

  if (selectedIds.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex h-9.5 items-center gap-1 rounded-lg border border-border bg-card px-2 shadow-floating">
        <span className="px-2 text-xs font-medium text-foreground">
          {s.selected(selectedIds.length)}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={clearSelection} aria-label={s.clear}>
          <X className="size-3.5" />
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <UserCog className="size-3.5" />
              {s.changeOwner}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {OWNER_NAMES.map((name) => (
              <DropdownMenuItem key={name} onSelect={() => bulkUpdateOwner(selectedIds, name)}>
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
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Flag className="size-3.5" />
              {s.changePriority}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <DropdownMenuItem key={p} onSelect={() => bulkUpdatePriority(selectedIds, p)}>
                {PRIORITY_LABEL[p][language]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <GitBranch className="size-3.5" />
              {s.changeStage}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {STAGES.map((stage) => (
              <DropdownMenuItem
                key={stage.id}
                onSelect={() => bulkChangeStage(selectedIds, stage.id)}
              >
                {language === "ar" ? stage.labelAr : stage.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            downloadCsv(
              "candidates-selected.csv",
              opportunitiesToCsv(opportunities.filter((o) => selectedIds.includes(o.id)))
            )
          }
        >
          <Download className="size-3.5" />
          {s.exportSelected}
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={() => requestDelete(selectedIds)}
        >
          <Trash2 className="size-3.5" />
          {s.deleteAction}
        </Button>
      </div>
    </div>
  )
}
