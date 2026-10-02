import { Inbox, SearchX, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"

function IconBadge({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icon className="size-5" />
    </div>
  )
}

/**
 * Differentiates "nothing exists yet" from "search found nothing" from
 * "filters found nothing" (spec §25) — never one generic empty state.
 */
export function OpportunitiesEmptyState() {
  const state = useOpportunitiesStore()
  const s = t(state.language)
  const hasSearch = state.search.trim().length > 0
  const hasFilters =
    state.ownerFilter !== "all" ||
    state.priorityFilter !== "all" ||
    state.sourceFilter !== "all" ||
    state.statusFilter !== "all"

  if (state.opportunities.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center animate-fade-up-sm">
        <IconBadge icon={Inbox} />
        <p className="text-sm text-muted-foreground">{s.noOpportunitiesYetTitle}</p>
        <Button size="sm" onClick={() => state.openCreateForm()}>
          {s.addOpportunity}
        </Button>
      </div>
    )
  }

  if (hasSearch) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center animate-fade-up-sm">
        <IconBadge icon={SearchX} />
        <p className="text-sm text-muted-foreground">{s.searchNoResultsFor(state.search.trim())}</p>
        <Button variant="outline" size="sm" onClick={() => state.setSearch("")}>
          {s.clearSearch}
        </Button>
      </div>
    )
  }

  if (hasFilters) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center animate-fade-up-sm">
        <IconBadge icon={FilterX} />
        <p className="text-sm text-muted-foreground">{s.noFilterResultsTitle}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            state.clearAllFilters()
            state.setStatusFilter("all")
          }}
        >
          {s.clearFilters}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-16 text-sm text-muted-foreground">
      {s.noResults}
    </div>
  )
}
