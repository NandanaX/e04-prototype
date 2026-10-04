import { useEffect } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, GripVertical } from "lucide-react"
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
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, t } from "@/lib/i18n"
import { STAGE_MAP, type Opportunity, type Priority } from "@/data/types"
import { OWNER_NAMES, avatarForOwnerName } from "@/data/opportunities"
import {
  canEditOpportunity,
  selectVisibleOpportunities,
  useOpportunitiesStore,
  type Language,
  type SortField,
} from "@/store/opportunities-store"
import { PriorityBadge, StageBadge } from "./badges"
import { RowActionsMenu, RowContextMenu } from "./RowActionsMenu"
import { OpportunitiesEmptyState } from "./EmptyState"

const PRIORITY_LABEL: Record<Priority, { en: string; ar: string }> = {
  high: { en: "High", ar: "مرتفعة" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
}

function SortHeader({ field, children }: { field: SortField; children: React.ReactNode }) {
  const { sortField, sortDir, setSort } = useOpportunitiesStore()
  const active = sortField === field
  return (
    <button
      type="button"
      onClick={() => setSort(field)}
      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-foreground/80 focus-visible:underline"
    >
      {children}
      {active ? (
        sortDir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
      )}
    </button>
  )
}

function stopRowClick(e: React.SyntheticEvent) {
  e.stopPropagation()
}

const SORT_ARIA: Record<string, "ascending" | "descending" | "none"> = {
  asc: "ascending",
  desc: "descending",
}

function sortAriaFor(sortField: SortField, sortDir: "asc" | "desc", field: SortField) {
  return sortField === field ? SORT_ARIA[sortDir] : "none"
}

function Row({ o, language }: { o: Opportunity; language: Language }) {
  const state = useOpportunitiesStore()
  const s = t(language)
  const selected = state.selectedIds.includes(o.id)
  const editable = canEditOpportunity(o)
  const lockedTitle = editable ? undefined : s.permissionDenied(s.actionEditVerb)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: o.id,
  })

  return (
    <RowContextMenu opp={o} language={language}>
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-state={selected ? "selected" : undefined}
      tabIndex={0}
      className={isDragging ? "relative z-10 opacity-60" : "group cursor-pointer"}
      onClick={() => state.openCandidateProfile(o.id)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          state.openCandidateProfile(o.id)
        }
      }}
    >
      <TableCell onClick={stopRowClick} className="w-6 px-0 text-center">
        <button
          type="button"
          aria-label={s.dragHandle}
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60 hover:text-muted-foreground active:cursor-grabbing active:text-foreground"
        >
          <GripVertical className="size-3.5" />
        </button>
      </TableCell>
      <TableCell onClick={stopRowClick}>
        <Checkbox
          checked={selected}
          onCheckedChange={() => state.toggleSelect(o.id)}
          aria-label={`Select ${o.name}`}
        />
      </TableCell>
      <TableCell onClick={stopRowClick}>
        <RowActionsMenu opp={o} language={language} />
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">{o.id}</TableCell>
      <TableCell className="max-w-[240px]">
        <div className="truncate font-medium">{o.name}</div>
        <div className="truncate text-2xs text-muted-foreground">{o.contact}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">{o.account}</TableCell>
      <TableCell onClick={stopRowClick}>
        <Select
          value={o.priority}
          onValueChange={(v) => state.updatePriority(o.id, v as Priority)}
          disabled={!editable}
        >
          <SelectTrigger
            title={lockedTitle}
            className="h-auto w-auto gap-1 rounded-full border-none bg-transparent p-0 shadow-none hover:opacity-80 active:opacity-65 disabled:opacity-100 [&_svg]:size-3 [&_svg]:opacity-40 data-[size=default]:h-auto"
          >
            <SelectValue>
              <PriorityBadge priority={o.priority} language={language} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABEL[p][language]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <StageBadge stage={STAGE_MAP[o.stage]} language={language} />
      </TableCell>
      <TableCell className="text-end tabular-nums">{formatCurrency(o.amount, language)}</TableCell>
      <TableCell className="text-end tabular-nums text-muted-foreground" onClick={stopRowClick}>
        <input
          type="number"
          min={0}
          max={100}
          defaultValue={o.probability}
          disabled={!editable}
          title={lockedTitle}
          onBlur={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n) && n !== o.probability) state.updateProbability(o.id, n)
          }}
          className="w-12 rounded bg-transparent px-1 text-end tabular-nums outline-none transition-colors hover:bg-accent/50 focus:bg-card focus:ring-1 focus:ring-ring disabled:hover:bg-transparent disabled:opacity-100"
        />
        %
      </TableCell>
      <TableCell className="text-muted-foreground" onClick={stopRowClick}>
        <input
          type="date"
          defaultValue={o.closeDate}
          disabled={!editable}
          title={lockedTitle}
          onChange={(e) => {
            if (e.target.value) state.updateCloseDate(o.id, e.target.value)
          }}
          className="rounded bg-transparent px-1 py-0.5 text-xs outline-none transition-colors hover:bg-accent/50 focus:bg-card focus:ring-1 focus:ring-ring disabled:hover:bg-transparent disabled:opacity-100"
        />
      </TableCell>
      <TableCell onClick={stopRowClick}>
        <Select value={o.owner} onValueChange={(v) => state.updateOwner(o.id, v)} disabled={!editable}>
          <SelectTrigger
            title={lockedTitle}
            className="h-auto w-auto gap-1.5 rounded-md border-none bg-transparent p-0 shadow-none hover:opacity-80 active:opacity-65 disabled:opacity-100 [&_svg]:size-3 [&_svg]:opacity-40 data-[size=default]:h-auto"
          >
            <SelectValue>
              <span className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarImage src={o.ownerAvatar} alt="" />
                  <AvatarFallback className="text-[9px]">{o.ownerInitials}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">{o.owner}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {OWNER_NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                <span className="flex items-center gap-2">
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
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
    </RowContextMenu>
  )
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export function ListView() {
  const state = useOpportunitiesStore()
  const s = t(state.language)
  const rows = selectVisibleOpportunities(state)

  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize))
  const page = Math.min(state.page, totalPages)
  const pageStart = (page - 1) * state.pageSize
  const pageRows = rows.slice(pageStart, pageStart + state.pageSize)
  const ids = pageRows.map((o) => o.id)
  const allSelected = ids.length > 0 && ids.every((id) => state.selectedIds.includes(id))

  // Filters/sort/page-size changes can leave `page` past the new last page
  // (e.g. narrowing a filter while on page 3) — snap back rather than show a blank page.
  useEffect(() => {
    if (state.page > totalPages) state.setPage(totalPages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, totalPages])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    state.reorderManual(ids, String(active.id), String(over.id))
  }

  if (rows.length === 0) {
    return <OpportunitiesEmptyState />
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-fade-up-sm">
      <div className="flex-1 overflow-auto px-3 pt-2">
      {/* DndContext must wrap the whole <table>, not sit inside it — it renders
          hidden accessibility elements as siblings of its children, which would
          otherwise land as invalid direct children of <table>. */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Table>
          {/* Header renders as a self-contained rounded bar (OSOS Table component
              pattern) rather than a row butted against the body — first/last cells
              carry the corner radius since a <tr> itself won't reliably clip it. */}
          <TableHeader className="sticky top-0 z-10">
            <tr className="[&>th]:h-11 [&>th]:bg-[#f7f6f7] [&>th:first-child]:rounded-l-2xl [&>th:last-child]:rounded-r-2xl">
              <TableHead className="w-6" />
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => state.toggleSelectAll(ids)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-28" />
              <TableHead>{s.opportunityId}</TableHead>
              <TableHead aria-sort={sortAriaFor(state.sortField, state.sortDir, "name")}>
                <SortHeader field="name">{s.name}</SortHeader>
              </TableHead>
              <TableHead aria-sort={sortAriaFor(state.sortField, state.sortDir, "account")}>
                <SortHeader field="account">{s.account}</SortHeader>
              </TableHead>
              <TableHead>{s.priority}</TableHead>
              <TableHead aria-sort={sortAriaFor(state.sortField, state.sortDir, "stage")}>
                <SortHeader field="stage">{s.stage}</SortHeader>
              </TableHead>
              <TableHead className="text-end" aria-sort={sortAriaFor(state.sortField, state.sortDir, "amount")}>
                <SortHeader field="amount">{s.amount}</SortHeader>
              </TableHead>
              <TableHead
                className="text-end"
                aria-sort={sortAriaFor(state.sortField, state.sortDir, "probability")}
              >
                <SortHeader field="probability">{s.probability}</SortHeader>
              </TableHead>
              <TableHead aria-sort={sortAriaFor(state.sortField, state.sortDir, "closeDate")}>
                <SortHeader field="closeDate">{s.closeDate}</SortHeader>
              </TableHead>
              <TableHead aria-sort={sortAriaFor(state.sortField, state.sortDir, "owner")}>
                <SortHeader field="owner">{s.ownerCol}</SortHeader>
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {/* 8px gap between the floating header bar and the first row */}
            <tr aria-hidden="true" className="h-2">
              <td colSpan={12} />
            </tr>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {pageRows.map((o) => (
                <Row key={o.id} o={o} language={state.language} />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
      </div>
      <div
        className="mx-3 mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-full border border-border/60 bg-card px-4 py-2 text-xs text-muted-foreground shadow-card"
        aria-live="polite"
      >
        <span>{s.showingRange(rows.length === 0 ? 0 : pageStart + 1, Math.min(pageStart + state.pageSize, rows.length), rows.length)}</span>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5">
            {s.rowsPerPage}
            <Select
              value={String(state.pageSize)}
              onValueChange={(v) => state.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="h-7 w-17 border-none bg-transparent px-1.5 shadow-none hover:bg-accent/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <span className="tabular-nums">{s.pageOf(page, totalPages)}</span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={s.prevPage}
              disabled={page <= 1}
              onClick={() => state.setPage(page - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={s.nextPage}
              disabled={page >= totalPages}
              onClick={() => state.setPage(page + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

