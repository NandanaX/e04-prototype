import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadCsv, opportunitiesToCsv } from "@/lib/csv"
import { t } from "@/lib/i18n"
import { selectVisibleOpportunities, useOpportunitiesStore } from "@/store/opportunities-store"

export function PageHeader() {
  const state = useOpportunitiesStore()
  const { language, openCreateForm, pushToast } = state
  const s = t(language)
  // "Results" always reflects the active search/filter/tab — the StatsCards row
  // above is the one place that intentionally always shows org-wide totals.
  const visible = selectVisibleOpportunities(state)

  function handleExport() {
    if (visible.length === 0) {
      pushToast("info", s.exportEmpty)
      return
    }
    downloadCsv("opportunities.csv", opportunitiesToCsv(visible))
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
      <div>
        <h2 className="text-xl leading-7 font-semibold text-foreground">
          {s.allOpportunitiesTitle}
        </h2>
        <p className="text-2xs text-helper">
          {visible.length} {s.results}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="size-3.5" />
          {s.exportBtn}
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => openCreateForm()}>
          <Plus className="size-3.5" />
          {s.addOpportunity}
        </Button>
      </div>
    </div>
  )
}
