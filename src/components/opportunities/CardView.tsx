import { useEffect, useRef, useState } from "react"
import { GripVertical, Loader2 } from "lucide-react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { t } from "@/lib/i18n"
import type { Opportunity } from "@/data/types"
import {
  selectVisibleOpportunities,
  useOpportunitiesStore,
  type Language,
} from "@/store/opportunities-store"
import { OpportunityCard } from "./OpportunityCard"
import { OpportunitiesEmptyState } from "./EmptyState"

const BATCH_SIZE = 20
// Only the first batch gets a staggered entrance — items beyond this share one delay
// instead of a long cascading wait (spec: don't stagger dozens of items).
const MAX_STAGGER_INDEX = 12

function SortableCard({ opp, language, index }: { opp: Opportunity; language: Language; index: number }) {
  const state = useOpportunitiesStore()
  const s = t(language)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: opp.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        animationDelay: `${Math.min(index, MAX_STAGGER_INDEX) * 25}ms`,
      }}
      className={isDragging ? "group relative z-10 opacity-60" : "group relative animate-fade-up-sm"}
    >
      <button
        type="button"
        aria-label={s.dragHandle}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute end-2 bottom-2 z-10 cursor-grab touch-none rounded p-0.5 text-muted-foreground/0 transition-colors group-hover:bg-accent group-hover:text-muted-foreground/70 hover:bg-accent/80 active:cursor-grabbing active:bg-accent"
      >
        <GripVertical className="size-3.5" />
      </button>
      <OpportunityCard
        opp={opp}
        language={language}
        selected={state.selectedIds.includes(opp.id)}
        onToggleSelect={() => state.toggleSelect(opp.id)}
      />
    </div>
  )
}

export function CardView() {
  const state = useOpportunitiesStore()
  const s = t(state.language)
  const allItems = selectVisibleOpportunities(state)
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const items = allItems.slice(0, visibleCount)
  const ids = items.map((o) => o.id)
  const hasMore = visibleCount < allItems.length
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset the visible batch when the underlying filtered set changes shape
  // (new search/filter/tab), so lazy-loading always starts from a clean slate.
  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [state.search, state.ownerFilter, state.priorityFilter, state.statusFilter, state.sortField, state.sortDir])

  useEffect(() => {
    if (!hasMore) return
    const sentinel = sentinelRef.current
    const root = scrollRef.current
    if (!sentinel || !root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => c + BATCH_SIZE)
      },
      { root, rootMargin: "400px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    state.reorderManual(ids, String(active.id), String(over.id))
  }

  if (allItems.length === 0) {
    return <OpportunitiesEmptyState />
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto p-4 animate-fade-up-sm">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((opp, index) => (
              <SortableCard key={opp.id} opp={opp} language={state.language} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center gap-1.5 pt-4 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          {s.loadingMore}
        </div>
      )}

      <div className="px-1 pt-3 text-xs text-muted-foreground" aria-live="polite">
        {items.length} {s.of} {allItems.length} {s.results}
      </div>
    </div>
  )
}
