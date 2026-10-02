import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore, type StatusFilter } from "@/store/opportunities-store"

export function StatusTabs() {
  const { language, statusFilter, setStatusFilter } = useOpportunitiesStore()
  const s = t(language)

  return (
    <div className="border-b border-border px-6 py-2.5">
      {/* OSOS "Tabs Main Component" — a boxed, pill-segmented switcher. */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList variant="pill" className="h-auto">
          <TabsTrigger value="all">{s.tabAll}</TabsTrigger>
          <TabsTrigger value="open">{s.statOpen}</TabsTrigger>
          <TabsTrigger value="won">{s.statWon}</TabsTrigger>
          <TabsTrigger value="lost">{s.statLost}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
