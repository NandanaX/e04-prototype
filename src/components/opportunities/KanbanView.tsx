import { useEffect, useMemo, useRef, useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { STAGES, type Stage } from "@/data/types"
import { formatCurrency, t } from "@/lib/i18n"
import {
  selectVisibleOpportunities,
  useOpportunitiesStore,
} from "@/store/opportunities-store"
import { OpportunityCard } from "./OpportunityCard"
import { OpportunitiesEmptyState } from "./EmptyState"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

function DraggableCard({
  id,
  disabled,
  children,
}: {
  id: string
  disabled?: boolean
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none animate-fade-up-sm",
        isDragging && "opacity-40",
        disabled && "cursor-default"
      )}
    >
      {children}
    </div>
  )
}

function KanbanColumn({ stageId }: { stageId: Stage }) {
  const state = useOpportunitiesStore()
  const s = t(state.language)
  const stage = STAGES.find((st) => st.id === stageId)!
  const { setNodeRef, isOver } = useDroppable({ id: stageId })
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const all = selectVisibleOpportunities(state).filter((o) => o.stage === stageId)
  const total = all.reduce((sum, o) => sum + o.amount, 0)
  const items = all.slice(0, visibleCount)
  const hasMore = visibleCount < all.length

  function loadMore() {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    // Brief, deliberate delay so the loading indicator is perceivable — this lane
    // loads independently of the others (no cross-column blocking).
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE)
      setIsLoadingMore(false)
    }, 300)
  }

  // Auto-load the next batch ~400px before the lane's own scroll end, in addition
  // to the manual button below (so keyboard/touch users aren't relying on scroll alone).
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { root: el.closest("[data-kanban-scroll]"), rootMargin: "400px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, stageId])

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-lg bg-muted/40 animate-fade-up-sm">
      <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {state.language === "ar" ? stage.labelAr : stage.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {all.length} · {formatCurrency(total, state.language)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`${s.quickAdd} — ${state.language === "ar" ? stage.labelAr : stage.label}`}
          onClick={() => state.openCreateForm(stageId)}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <div
        ref={setNodeRef}
        data-kanban-scroll
        className={cn(
          "min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2 transition-colors",
          isOver && "bg-primary/5 outline-2 outline-dashed outline-primary/40 -outline-offset-2"
        )}
      >
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
            <span>{s.emptyColumn}</span>
            <span>{s.kanbanEmptyHint}</span>
            <Button variant="outline" size="xs" onClick={() => state.openCreateForm(stageId)}>
              <Plus className="size-3" /> {s.quickAdd}
            </Button>
          </div>
        )}
        {items.map((opp) => (
          <DraggableCard key={opp.id} id={opp.id} disabled={!!opp.restricted}>
            <OpportunityCard
              opp={opp}
              language={state.language}
              selected={state.selectedIds.includes(opp.id)}
              onToggleSelect={() => state.toggleSelect(opp.id)}
              density="compact"
              showStage={false}
            />
          </DraggableCard>
        ))}
        {hasMore && (
          <div ref={sentinelRef}>
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              aria-busy={isLoadingMore}
              className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-center text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  {s.loadingMore}
                </>
              ) : (
                <>
                  {items.length} {s.of} {all.length} — {s.loadMore}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanView() {
  const state = useOpportunitiesStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  const visible = selectVisibleOpportunities(state)

  const activeOpp = useMemo(
    () => state.opportunities.find((o) => o.id === activeId) ?? null,
    [activeId, state.opportunities]
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    state.attemptMoveStage(String(active.id), over.id as Stage)
  }

  if (visible.length === 0) {
    return <OpportunitiesEmptyState />
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex min-h-0 flex-1 overflow-x-auto p-4">
        <div className="flex h-full gap-3">
          {STAGES.map((stage) => (
            <KanbanColumn key={stage.id} stageId={stage.id} />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeOpp ? (
          <div className="w-72 rotate-[0.5deg] opacity-95 shadow-floating">
            <OpportunityCard
              opp={activeOpp}
              language={state.language}
              selected={false}
              onToggleSelect={() => {}}
              density="compact"
              showStage={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
