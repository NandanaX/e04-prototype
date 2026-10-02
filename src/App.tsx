import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { PageHeader } from "@/components/opportunities/PageHeader"
import { StatsCards } from "@/components/opportunities/StatsCards"
import { StatusTabs } from "@/components/opportunities/StatusTabs"
import { Toolbar } from "@/components/opportunities/Toolbar"
import { SelectionBar } from "@/components/opportunities/SelectionBar"
import { ListView } from "@/components/opportunities/ListView"
import { CardView } from "@/components/opportunities/CardView"
import { KanbanView } from "@/components/opportunities/KanbanView"
import { ListSkeleton } from "@/components/opportunities/ListSkeleton"
import { CardSkeleton } from "@/components/opportunities/CardSkeleton"
import { KanbanSkeleton } from "@/components/opportunities/KanbanSkeleton"
import { DropRejectionDialog, LostReasonDialog } from "@/components/opportunities/DropDialogs"
import { OpportunityDrawer } from "@/components/opportunities/OpportunityDrawer"
import { OpportunityForm } from "@/components/opportunities/OpportunityForm"
import { ConfirmDeleteDialog } from "@/components/opportunities/ConfirmDeleteDialog"
import { BulkResultDialog } from "@/components/opportunities/BulkResultDialog"
import { ToastViewport } from "@/components/opportunities/ToastViewport"
import { syncUrlFromState, useOpportunitiesStore } from "@/store/opportunities-store"

// There's no real network fetch in this prototype (data is in-memory), so this
// is a deliberately brief, honest stand-in for a first-paint loading state —
// long enough to prove the skeleton→content transition works, not to stall the UI.
const INITIAL_LOAD_MS = 450

function App() {
  const { view, language, statusFilter, ownerFilter, priorityFilter, sortField, sortDir } =
    useOpportunitiesStore()
  const [initialLoading, setInitialLoading] = useState(true)

  // Framework rule: the working context (view + status tab + filters + sort)
  // lives in the URL (read once at store creation) so a refresh or a shared
  // link returns to the same working set instead of resetting to defaults.
  // This effect just keeps the URL in sync as any of those change.
  useEffect(() => {
    syncUrlFromState({ view, statusFilter, ownerFilter, priorityFilter, sortField, sortDir })
  }, [view, statusFilter, ownerFilter, priorityFilter, sortField, sortDir])

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const handle = setTimeout(() => setInitialLoading(false), INITIAL_LOAD_MS)
    return () => clearTimeout(handle)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />
        <div className="animate-fade-up">
          <PageHeader />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "40ms" }}>
          <StatsCards />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden p-6 pt-4">
          <div
            className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <StatusTabs />
            <Toolbar />

            <main className="flex flex-1 flex-col overflow-hidden" aria-busy={initialLoading}>
              {initialLoading ? (
                <>
                  {view === "list" && <ListSkeleton />}
                  {view === "card" && <CardSkeleton />}
                  {view === "kanban" && <KanbanSkeleton />}
                </>
              ) : (
                <>
                  {view === "list" && <ListView />}
                  {view === "card" && <CardView />}
                  {view === "kanban" && <KanbanView />}
                </>
              )}
            </main>

            <SelectionBar />
          </div>
        </div>
      </div>

      <DropRejectionDialog />
      <LostReasonDialog />
      <OpportunityDrawer />
      <OpportunityForm />
      <ConfirmDeleteDialog />
      <BulkResultDialog />
      <ToastViewport />
    </div>
  )
}

export default App
