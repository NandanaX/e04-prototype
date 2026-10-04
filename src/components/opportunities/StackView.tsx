import { useEffect, useRef, useState } from "react"
import { ChevronRight, Loader2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, t } from "@/lib/i18n"
import { STAGE_MAP, type Opportunity } from "@/data/types"
import { avatarForCandidateId, avatarForOwnerName } from "@/data/opportunities"
import {
  selectVisibleOpportunities,
  useOpportunitiesStore,
  type Language,
} from "@/store/opportunities-store"
import { PriorityBadge, StageBadge } from "./badges"
import { OpportunitiesEmptyState } from "./EmptyState"

const BATCH_SIZE = 20
const MAX_STAGGER_INDEX = 12

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
}

function StackRow({ o, language, index }: { o: Opportunity; language: Language; index: number }) {
  const state = useOpportunitiesStore()
  const s = t(language)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => state.openCandidateProfile(o.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          state.openCandidateProfile(o.id)
        }
      }}
      style={{ animationDelay: `${Math.min(index, MAX_STAGGER_INDEX) * 25}ms` }}
      className="group flex animate-fade-up-sm cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card outline-none transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-hover focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar size="lg" className="shrink-0">
        <AvatarImage src={avatarForCandidateId(o.id)} alt="" />
        <AvatarFallback>{initialsOf(o.name)}</AvatarFallback>
      </Avatar>

      <div className="w-52 min-w-0 shrink-0">
        <div className="truncate text-sm font-semibold text-foreground">{o.name}</div>
        <div className="truncate text-xs text-muted-foreground">{o.account}</div>
        <div className="truncate text-2xs text-muted-foreground">{o.id}</div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <StageBadge stage={STAGE_MAP[o.stage]} language={language} />
          <PriorityBadge priority={o.priority} language={language} />
          <Badge className="bg-muted text-muted-foreground">{formatCurrency(o.amount, language)}</Badge>
          <Badge className="bg-muted text-muted-foreground">{o.probability}%</Badge>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 truncate text-2xs text-muted-foreground">
          <Avatar className="size-4 shrink-0">
            <AvatarImage src={avatarForOwnerName(o.owner)} alt="" />
            <AvatarFallback className="text-[7px]">{o.ownerInitials}</AvatarFallback>
          </Avatar>
          <span className="truncate">
            {o.owner} · {formatDate(o.closeDate, language)}
            {o.nextStep !== "—" ? ` · ${o.nextStep}` : ""}
          </span>
        </div>
      </div>

      <ChevronRight
        aria-label={s.view}
        className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
      />
    </div>
  )
}

export function StackView() {
  const state = useOpportunitiesStore()
  const s = t(state.language)
  const allItems = selectVisibleOpportunities(state)
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const items = allItems.slice(0, visibleCount)
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

  if (allItems.length === 0) {
    return <OpportunitiesEmptyState />
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto p-4 animate-fade-up-sm">
      <div className="flex flex-col gap-3">
        {items.map((opp, index) => (
          <StackRow key={opp.id} o={opp} language={state.language} index={index} />
        ))}
      </div>

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
