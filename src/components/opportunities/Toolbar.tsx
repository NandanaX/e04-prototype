import { useEffect, useState } from "react"
import { LayoutGrid, List, Search, Columns3, Rows3, Languages, X, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore, type SortField, type ViewMode } from "@/store/opportunities-store"
import { OWNER_NAMES, avatarForOwnerName } from "@/data/opportunities"

const PRIORITY_LABEL = {
  high: { en: "High", ar: "مرتفعة" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
} as const

const SORT_OPTIONS: { field: SortField; dir: "asc" | "desc"; key: string }[] = [
  { field: "name", dir: "asc", key: "sortNameAsc" },
  { field: "name", dir: "desc", key: "sortNameDesc" },
  { field: "amount", dir: "desc", key: "sortValueDesc" },
  { field: "amount", dir: "asc", key: "sortValueAsc" },
  { field: "closeDate", dir: "asc", key: "sortCloseDateAsc" },
  { field: "closeDate", dir: "desc", key: "sortCloseDateDesc" },
  { field: "probability", dir: "desc", key: "sortProbabilityDesc" },
  { field: "stage", dir: "asc", key: "sortStageOrder" },
  { field: "custom", dir: "asc", key: "sortCustomOrder" },
]

export function Toolbar() {
  const state = useOpportunitiesStore()
  const s = t(state.language)

  // Debounced so typing doesn't re-filter/re-render on every keystroke, while
  // staying instantly responsive to the visible input value itself.
  const [localSearch, setLocalSearch] = useState(state.search)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (localSearch !== state.search) state.setSearch(localSearch)
    }, 250)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch])
  useEffect(() => {
    setLocalSearch(state.search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.search])

  const sortValue = `${state.sortField}:${state.sortDir}`
  const hasFilters = state.ownerFilter !== "all" || state.priorityFilter !== "all"

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-card px-6 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={s.search}
              className="w-56 ps-8 pe-8"
            />
            {localSearch && (
              <button
                type="button"
                aria-label={s.clearSearch}
                onClick={() => {
                  setLocalSearch("")
                  state.setSearch("")
                }}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground active:text-foreground/70"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <Select value={state.ownerFilter} onValueChange={state.setOwnerFilter}>
            <SelectTrigger
              size="sm"
              className={
                state.ownerFilter !== "all"
                  ? "w-[150px] border-primary/40 bg-accent font-medium text-primary"
                  : "w-[150px]"
              }
            >
              <SelectValue placeholder={s.owner} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{s.allOwners}</SelectItem>
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

          <Select
            value={state.priorityFilter}
            onValueChange={(v) => state.setPriorityFilter(v as typeof state.priorityFilter)}
          >
            <SelectTrigger
              size="sm"
              className={
                state.priorityFilter !== "all"
                  ? "w-[140px] border-primary/40 bg-accent font-medium text-primary"
                  : "w-[140px]"
              }
            >
              <SelectValue placeholder={s.priority} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{s.allPriorities}</SelectItem>
              <SelectItem value="high">{PRIORITY_LABEL.high[state.language]}</SelectItem>
              <SelectItem value="medium">{PRIORITY_LABEL.medium[state.language]}</SelectItem>
              <SelectItem value="low">{PRIORITY_LABEL.low[state.language]}</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <Select
            value={sortValue}
            onValueChange={(v) => {
              const [field, dir] = v.split(":") as [SortField, "asc" | "desc"]
              state.setSortExplicit(field, dir)
            }}
          >
            <SelectTrigger size="sm" className="w-[190px]">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder={s.sortBy} />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.key} value={`${opt.field}:${opt.dir}`}>
                  {s[opt.key as keyof typeof s] as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* View switcher — OSOS "Tabs Main Component" pill pattern — sits right
              before the language toggle; current view is not lost on refresh
              (see App.tsx URL sync). */}
          <Tabs value={state.view} onValueChange={(v) => state.setView(v as ViewMode)} className="shrink-0">
            <TabsList variant="pill" className="h-auto">
              <TabsTrigger value="list" aria-label={s.listView} className="gap-1.5">
                <List className="size-4" />
                <span className="hidden md:inline">{s.listView}</span>
              </TabsTrigger>
              <TabsTrigger value="card" aria-label={s.cardView} className="gap-1.5">
                <LayoutGrid className="size-4" />
                <span className="hidden md:inline">{s.cardView}</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" aria-label={s.kanbanView} className="gap-1.5">
                <Columns3 className="size-4" />
                <span className="hidden md:inline">{s.kanbanView}</span>
              </TabsTrigger>
              <TabsTrigger value="stack" aria-label={s.stackView} className="gap-1.5">
                <Rows3 className="size-4" />
                <span className="hidden md:inline">{s.stackView}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => state.setLanguage(state.language === "en" ? "ar" : "en")}
          >
            <Languages className="size-4" />
            {s.language}
          </Button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-2xs text-helper">{s.activeFilters}:</span>
          {state.ownerFilter !== "all" && (
            <Badge className="gap-1 bg-info/10 text-info">
              {s.owner}: {state.ownerFilter}
              <button
                type="button"
                aria-label={s.clear}
                onClick={() => state.setOwnerFilter("all")}
                className="ms-0.5 rounded-full opacity-70 transition-opacity hover:opacity-100 active:opacity-60"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {state.priorityFilter !== "all" && (
            <Badge className="gap-1 bg-info/10 text-info">
              {s.priority}: {PRIORITY_LABEL[state.priorityFilter][state.language]}
              <button
                type="button"
                aria-label={s.clear}
                onClick={() => state.setPriorityFilter("all")}
                className="ms-0.5 rounded-full opacity-70 transition-opacity hover:opacity-100 active:opacity-60"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={() => state.clearAllFilters()}
          >
            {s.clearAllFilters}
          </Button>
        </div>
      )}
    </div>
  )
}
