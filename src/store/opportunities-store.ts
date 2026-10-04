import { create, type StoreApi } from "zustand"
import { OPPORTUNITIES, avatarForOwnerName } from "@/data/opportunities"
import { STAGES, STAGE_MAP, type Opportunity, type Priority, type Source, type Stage } from "@/data/types"
import { t } from "@/lib/i18n"
import { simulateWrite } from "@/lib/mockApi"

export type ViewMode = "list" | "card" | "kanban"
export type SortField =
  | "name"
  | "account"
  | "amount"
  | "closeDate"
  | "probability"
  | "owner"
  | "stage"
  | "custom"
export type SortDir = "asc" | "desc"
export type Language = "en" | "ar"
export type StatusFilter = "all" | "open" | "won" | "lost"

export interface Toast {
  id: string
  tone: "success" | "error" | "info"
  message: string
}

export interface BulkResult {
  action: string
  updated: number
  failed: { id: string; name: string; reason: string }[]
}

export interface NewOpportunityInput {
  name: string
  account: string
  stage: Stage
  priority: Priority
  amount: number
  probability: number
  closeDate: string
  owner: string
}

export type FormState =
  | { mode: "create"; prefillStage?: Stage }
  | { mode: "edit"; editId: string }

interface DropRejection {
  oppId: string
  fromStage: Stage
  toStage: Stage
  reason: string
}

interface PendingLostConfirmation {
  oppIds: string[]
  fromStage: Stage
}

interface DeleteConfirm {
  ids: string[]
}

interface OpportunitiesState {
  opportunities: Opportunity[]
  view: ViewMode
  language: Language
  search: string
  ownerFilter: string | "all"
  priorityFilter: Priority | "all"
  sourceFilter: Source | "all"
  statusFilter: StatusFilter
  sortField: SortField
  sortDir: SortDir
  /** The last user-dragged order — only consulted while sortField === "custom". */
  manualOrder: string[]
  /** List view pagination — 1-indexed. Card/Kanban use their own lazy-load batching instead. */
  page: number
  pageSize: number
  selectedIds: string[]
  savingIds: string[]
  openDrawerId: string | null
  formState: FormState | null
  /** Set after "Save and Continue" on a new candidate — renders the full profile page instead of the list. */
  profileCandidateId: string | null
  deleteConfirm: DeleteConfirm | null
  toasts: Toast[]
  bulkResult: BulkResult | null
  dropRejection: DropRejection | null
  pendingLostConfirmation: PendingLostConfirmation | null

  setView: (v: ViewMode) => void
  setLanguage: (l: Language) => void
  setSearch: (s: string) => void
  setOwnerFilter: (o: string | "all") => void
  setPriorityFilter: (p: Priority | "all") => void
  setSourceFilter: (s: Source | "all") => void
  setStatusFilter: (s: StatusFilter) => void
  clearAllFilters: () => void
  setSort: (field: SortField) => void
  setSortExplicit: (field: SortField, dir: SortDir) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  /** Reorders `draggedId` to sit where `overId` is, based on the order currently on screen. */
  reorderManual: (visibleIds: string[], draggedId: string, overId: string) => void
  toggleSelect: (id: string) => void
  toggleSelectAll: (ids: string[]) => void
  clearSelection: () => void

  openDrawer: (id: string) => void
  closeDrawer: () => void
  openCreateForm: (prefillStage?: Stage) => void
  openEditForm: (id: string) => void
  closeForm: () => void
  openCandidateProfile: (id: string) => void
  closeCandidateProfile: () => void

  pushToast: (tone: Toast["tone"], message: string) => void
  dismissToast: (id: string) => void
  dismissBulkResult: () => void

  requestDelete: (ids: string[]) => void
  cancelDelete: () => void
  confirmDelete: () => void

  attemptMoveStage: (oppId: string, toStage: Stage) => void
  confirmLostMove: (lostReason: string) => void
  cancelPendingMove: () => void
  dismissRejection: () => void

  updatePriority: (id: string, priority: Priority) => void
  updateOwner: (id: string, owner: string) => void
  updateProbability: (id: string, probability: number) => void
  updateCloseDate: (id: string, closeDate: string) => void
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void

  /** Returns the new candidate's id on success, or null if the write failed. */
  createOpportunity: (input: NewOpportunityInput) => Promise<string | null>
  duplicateOpportunity: (id: string) => void
  deleteOpportunity: (id: string) => void

  bulkUpdatePriority: (ids: string[], priority: Priority) => void
  bulkUpdateOwner: (ids: string[], owner: string) => void
  bulkChangeStage: (ids: string[], toStage: Stage) => void
  bulkDelete: (ids: string[]) => void
}

type SetFn = StoreApi<OpportunitiesState>["setState"]
type GetFn = StoreApi<OpportunitiesState>["getState"]

const STAGE_ORDER = STAGES.map((s) => s.id)

const VALID_VIEWS: ViewMode[] = ["list", "card", "kanban"]
const VALID_STATUS: StatusFilter[] = ["all", "open", "won", "lost"]
const VALID_SORT_FIELDS: SortField[] = [
  "name",
  "account",
  "amount",
  "closeDate",
  "probability",
  "owner",
  "stage",
  "custom",
]

function readParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

// The working view/filter/sort context lives in the URL (framework rule): read it
// once at store creation so the very first render already matches a refreshed or
// shared link, rather than flashing defaults and correcting itself after mount.
function initialView(): ViewMode {
  const fromQuery = readParams().get("view")
  if (fromQuery && (VALID_VIEWS as string[]).includes(fromQuery)) return fromQuery as ViewMode
  if (typeof window !== "undefined") {
    const fromHash = window.location.hash.replace("#", "")
    if ((VALID_VIEWS as string[]).includes(fromHash)) return fromHash as ViewMode
  }
  return "list"
}
function initialStatus(): StatusFilter {
  const p = readParams().get("status")
  return p && (VALID_STATUS as string[]).includes(p) ? (p as StatusFilter) : "all"
}
function initialOwner(): string {
  return readParams().get("owner") ?? "all"
}
function initialPriority(): Priority | "all" {
  const p = readParams().get("priority")
  return p === "high" || p === "medium" || p === "low" ? p : "all"
}
function initialSortField(): SortField {
  const p = readParams().get("sort")
  return p && (VALID_SORT_FIELDS as string[]).includes(p) ? (p as SortField) : "closeDate"
}
function initialSortDir(): SortDir {
  return readParams().get("dir") === "desc" ? "desc" : "asc"
}

/** Call from an effect whenever view/status/owner/priority/sort change, to keep the URL shareable. */
export function syncUrlFromState(state: {
  view: ViewMode
  statusFilter: StatusFilter
  ownerFilter: string | "all"
  priorityFilter: Priority | "all"
  sortField: SortField
  sortDir: SortDir
}) {
  if (typeof window === "undefined") return
  const params = new URLSearchParams()
  params.set("view", state.view)
  if (state.statusFilter !== "all") params.set("status", state.statusFilter)
  if (state.ownerFilter !== "all") params.set("owner", state.ownerFilter)
  if (state.priorityFilter !== "all") params.set("priority", state.priorityFilter)
  params.set("sort", state.sortField)
  params.set("dir", state.sortDir)
  const query = params.toString()
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`)
}

function stageIndex(stage: Stage) {
  return STAGE_ORDER.indexOf(stage)
}

function genId(existing: Opportunity[]): string {
  const max = existing.reduce((m, o) => {
    const n = parseInt(o.id.replace("CAND-", ""), 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `CAND-${String(max + 1).padStart(4, "0")}`
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}

/** A restricted record represents a demo permission boundary: the current mock user cannot edit/move/delete it. */
export function canEditOpportunity(opp: Opportunity): boolean {
  return !opp.restricted
}

type MoveOutcome =
  | { kind: "rejected"; reason: string }
  | { kind: "needs-reason" }
  | { kind: "ok" }

// The single business-rule source of truth for stage transitions — used by drag/drop,
// the "Move to…" menu, and bulk stage-change alike, so validation never drifts between them.
function validateStageMove(opp: Opportunity, toStage: Stage, lang: Language): MoveOutcome {
  const fromClosed = opp.stage === "hired" || opp.stage === "rejected"

  if (fromClosed) {
    return {
      kind: "rejected",
      reason:
        lang === "ar"
          ? "لا يمكن إعادة فتح سجل مغلق بالسحب. عدّل السجل مباشرة."
          : "This candidate's record is closed. Reopen it from the record — not by dragging.",
    }
  }
  if (toStage === "hired" && opp.stage !== "offer-extended") {
    return {
      kind: "rejected",
      reason:
        lang === "ar"
          ? "انقل المرشح إلى \"تم تقديم العرض\" أولاً قبل تعيينه."
          : "Move it to Offer Extended first — Hired requires an accepted offer.",
    }
  }
  if (toStage === "rejected") return { kind: "needs-reason" }
  return { kind: "ok" }
}

/**
 * Apply a patch optimistically, then confirm against the (simulated) backend.
 * On failure, every id in the batch that failed is rolled back to its prior value.
 * Returns the ids that failed, so the caller can report success/partial/failure.
 */
async function applyOptimisticPatch(
  set: SetFn,
  get: GetFn,
  ids: string[],
  patch: Partial<Opportunity>
): Promise<string[]> {
  if (ids.length === 0) return []
  const prevMap = new Map(get().opportunities.filter((o) => ids.includes(o.id)).map((o) => [o.id, o]))
  set((state) => ({
    opportunities: state.opportunities.map((o) => (ids.includes(o.id) ? { ...o, ...patch } : o)),
    savingIds: [...state.savingIds, ...ids],
  }))
  const results = await Promise.allSettled(ids.map((id) => simulateWrite(id)))
  const failedIds = ids.filter((_, i) => results[i].status === "rejected")
  set((state) => ({
    savingIds: state.savingIds.filter((id) => !ids.includes(id)),
    opportunities: failedIds.length
      ? state.opportunities.map((o) => (failedIds.includes(o.id) ? (prevMap.get(o.id) ?? o) : o))
      : state.opportunities,
  }))
  return failedIds
}

async function applyOptimisticDelete(set: SetFn, get: GetFn, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return []
  const removed = get().opportunities.filter((o) => ids.includes(o.id))
  set((state) => ({
    opportunities: state.opportunities.filter((o) => !ids.includes(o.id)),
    selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    savingIds: [...state.savingIds, ...ids],
  }))
  const results = await Promise.allSettled(ids.map((id) => simulateWrite(id)))
  const failedIds = ids.filter((_, i) => results[i].status === "rejected")
  set((state) => ({
    savingIds: state.savingIds.filter((id) => !ids.includes(id)),
    opportunities: failedIds.length
      ? [...state.opportunities, ...removed.filter((o) => failedIds.includes(o.id))]
      : state.opportunities,
  }))
  return failedIds
}

/** Reports the outcome of a (possibly multi-record) write as a toast, and — when partial — a bulkResult panel. */
function reportOutcome(
  set: SetFn,
  get: GetFn,
  action: string,
  allIds: string[],
  deniedIds: string[],
  otherFailedIds: string[],
  denyMessage: string,
  failMessage: string
) {
  const allFailed = [...deniedIds, ...otherFailedIds]
  const updated = allIds.length - allFailed.length
  const lang = get().language

  if (allIds.length <= 1) {
    if (allFailed.length) get().pushToast("error", failMessage)
    return
  }
  if (!allFailed.length) {
    get().pushToast("success", t(lang).bulkUpdated(updated))
    return
  }
  get().pushToast("error", updated > 0 ? t(lang).bulkPartial(updated, allFailed.length) : failMessage)
  const opps = get().opportunities
  set({
    bulkResult: {
      action,
      updated,
      failed: allFailed.map((id) => ({
        id,
        name: opps.find((o) => o.id === id)?.name ?? id,
        reason: deniedIds.includes(id) ? denyMessage : failMessage,
      })),
    },
  })
}

/** Splits a selection into records the current user may edit vs. permission-denied ones, then runs `op` on the rest. */
function runBulkOp(
  set: SetFn,
  get: GetFn,
  action: string,
  ids: string[],
  denyMessage: string,
  failMessage: string,
  op: (editableIds: string[]) => Promise<string[]>
) {
  const opportunities = get().opportunities
  const deniedIds = ids.filter((id) => {
    const o = opportunities.find((x) => x.id === id)
    return o ? !canEditOpportunity(o) : false
  })
  const editableIds = ids.filter((id) => !deniedIds.includes(id))
  op(editableIds).then((failedIds) => {
    reportOutcome(set, get, action, ids, deniedIds, failedIds, denyMessage, failMessage)
  })
}

export const useOpportunitiesStore = create<OpportunitiesState>((set, get) => ({
  opportunities: OPPORTUNITIES,
  view: initialView(),
  language: "en",
  search: "",
  ownerFilter: initialOwner(),
  priorityFilter: initialPriority(),
  sourceFilter: "all",
  statusFilter: initialStatus(),
  sortField: initialSortField(),
  sortDir: initialSortDir(),
  manualOrder: [],
  page: 1,
  pageSize: 10,
  selectedIds: [],
  savingIds: [],
  openDrawerId: null,
  formState: null,
  profileCandidateId: null,
  deleteConfirm: null,
  toasts: [],
  bulkResult: null,
  dropRejection: null,
  pendingLostConfirmation: null,

  setView: (v) => set({ view: v }),
  setLanguage: (l) => set({ language: l }),
  setSearch: (s) => set({ search: s, page: 1 }),
  setOwnerFilter: (o) => set({ ownerFilter: o, page: 1 }),
  setPriorityFilter: (p) => set({ priorityFilter: p, page: 1 }),
  setSourceFilter: (s) => set({ sourceFilter: s, page: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, page: 1 }),
  clearAllFilters: () =>
    set({ search: "", ownerFilter: "all", priorityFilter: "all", sourceFilter: "all", page: 1 }),

  setSort: (field) =>
    set((state) => ({
      sortField: field,
      sortDir: state.sortField === field && state.sortDir === "asc" ? "desc" : "asc",
      page: 1,
    })),
  setSortExplicit: (field, dir) => set({ sortField: field, sortDir: dir, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),

  // Rebuilds the manual order from exactly what was on screen (in the order shown),
  // with the dragged record moved next to its drop target — so the very first drag
  // always feels like "pick it up from here, drop it there," regardless of whatever
  // sort produced that on-screen order.
  reorderManual: (visibleIds, draggedId, overId) =>
    set((state) => {
      const oldIndex = visibleIds.indexOf(draggedId)
      const newIndex = visibleIds.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return {}
      const reordered = [...visibleIds]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      const hiddenIds = state.opportunities.map((o) => o.id).filter((id) => !visibleIds.includes(id))
      return { manualOrder: [...reordered, ...hiddenIds], sortField: "custom", sortDir: "asc" }
    }),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    })),

  toggleSelectAll: (ids) =>
    set((state) => {
      const allSelected = ids.every((id) => state.selectedIds.includes(id))
      if (allSelected) {
        return { selectedIds: state.selectedIds.filter((id) => !ids.includes(id)) }
      }
      const merged = new Set([...state.selectedIds, ...ids])
      return { selectedIds: Array.from(merged) }
    }),

  clearSelection: () => set({ selectedIds: [] }),

  openDrawer: (id) => set({ openDrawerId: id }),
  closeDrawer: () => set({ openDrawerId: null }),
  openCreateForm: (prefillStage) => set({ formState: { mode: "create", prefillStage } }),
  openEditForm: (id) => set({ formState: { mode: "edit", editId: id } }),
  closeForm: () => set({ formState: null }),
  openCandidateProfile: (id) => set({ profileCandidateId: id }),
  closeCandidateProfile: () => set({ profileCandidateId: null }),

  pushToast: (tone, message) => {
    const id = `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    set((state) => ({ toasts: [...state.toasts, { id, tone, message }] }))
    setTimeout(() => get().dismissToast(id), 4000)
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) })),
  dismissBulkResult: () => set({ bulkResult: null }),

  requestDelete: (ids) => {
    if (ids.length === 0) return
    set({ deleteConfirm: { ids } })
  },
  cancelDelete: () => set({ deleteConfirm: null }),
  confirmDelete: () => {
    const pending = get().deleteConfirm
    if (!pending) return
    set({ deleteConfirm: null })
    if (pending.ids.length === 1) get().deleteOpportunity(pending.ids[0])
    else get().bulkDelete(pending.ids)
  },

  // Framework rule: a drag/menu move is only ever a *proposed* move. It is
  // validated before anything is written back — see validateStageMove above.
  attemptMoveStage: (oppId, toStage) => {
    const { opportunities, language } = get()
    const opp = opportunities.find((o) => o.id === oppId)
    if (!opp || opp.stage === toStage) return

    if (!canEditOpportunity(opp)) {
      set({
        dropRejection: {
          oppId,
          fromStage: opp.stage,
          toStage,
          reason: t(language).permissionDenied(t(language).actionMoveVerb),
        },
      })
      return
    }

    const outcome = validateStageMove(opp, toStage, language)
    if (outcome.kind === "rejected") {
      set({ dropRejection: { oppId, fromStage: opp.stage, toStage, reason: outcome.reason } })
      return
    }
    if (outcome.kind === "needs-reason") {
      set({ pendingLostConfirmation: { oppIds: [oppId], fromStage: opp.stage } })
      return
    }

    applyOptimisticPatch(set, get, [oppId], { stage: toStage, lastActivityDate: "2026-09-08" }).then(
      (failed) => reportOutcome(set, get, "stage", [oppId], [], failed, "", t(get().language).saveFailed)
    )
  },

  confirmLostMove: (lostReason) => {
    const pending = get().pendingLostConfirmation
    if (!pending) return
    const ids = pending.oppIds
    set({ pendingLostConfirmation: null })
    applyOptimisticPatch(set, get, ids, {
      stage: "rejected",
      lostReason,
      lastActivityDate: "2026-09-08",
    }).then((failed) => reportOutcome(set, get, "stage", ids, [], failed, "", t(get().language).saveFailed))
  },

  cancelPendingMove: () => set({ pendingLostConfirmation: null }),
  dismissRejection: () => set({ dropRejection: null }),

  updatePriority: (id, priority) => {
    const opp = get().opportunities.find((o) => o.id === id)
    if (!opp) return
    if (!canEditOpportunity(opp)) {
      get().pushToast("error", t(get().language).permissionDenied(t(get().language).actionEditVerb))
      return
    }
    applyOptimisticPatch(set, get, [id], { priority }).then((failed) => {
      if (failed.length) get().pushToast("error", t(get().language).saveFailed)
    })
  },

  updateOwner: (id, owner) => {
    const opp = get().opportunities.find((o) => o.id === id)
    if (!opp) return
    if (!canEditOpportunity(opp)) {
      get().pushToast("error", t(get().language).permissionDenied(t(get().language).actionAssignVerb))
      return
    }
    applyOptimisticPatch(set, get, [id], {
      owner,
      ownerInitials: initialsFromName(owner),
      ownerAvatar: avatarForOwnerName(owner),
    }).then((failed) => {
      if (failed.length) get().pushToast("error", t(get().language).saveFailed)
    })
  },

  updateProbability: (id, probability) => {
    if (Number.isNaN(probability) || probability < 0 || probability > 100) return
    const opp = get().opportunities.find((o) => o.id === id)
    if (!opp) return
    if (!canEditOpportunity(opp)) {
      get().pushToast("error", t(get().language).permissionDenied(t(get().language).actionEditVerb))
      return
    }
    applyOptimisticPatch(set, get, [id], { probability }).then((failed) => {
      if (failed.length) get().pushToast("error", t(get().language).saveFailed)
    })
  },

  updateCloseDate: (id, closeDate) => {
    if (!closeDate) return
    const opp = get().opportunities.find((o) => o.id === id)
    if (!opp) return
    if (!canEditOpportunity(opp)) {
      get().pushToast("error", t(get().language).permissionDenied(t(get().language).actionEditVerb))
      return
    }
    applyOptimisticPatch(set, get, [id], { closeDate }).then((failed) => {
      if (failed.length) get().pushToast("error", t(get().language).saveFailed)
    })
  },

  updateOpportunity: (id, patch) => {
    const opp = get().opportunities.find((o) => o.id === id)
    if (!opp) return
    if (!canEditOpportunity(opp)) {
      get().pushToast("error", t(get().language).permissionDenied(t(get().language).actionEditVerb))
      return
    }
    applyOptimisticPatch(set, get, [id], patch).then((failed) => {
      if (failed.length) get().pushToast("error", t(get().language).saveFailed)
      else get().pushToast("success", t(get().language).changesSaved)
    })
  },

  createOpportunity: async (input) => {
    const id = genId(get().opportunities)
    const newOpp: Opportunity = {
      id,
      name: input.name,
      account: input.account,
      contact: "—",
      owner: input.owner,
      ownerInitials: initialsFromName(input.owner),
      ownerAvatar: avatarForOwnerName(input.owner),
      stage: input.stage,
      amount: input.amount,
      currency: "USD",
      probability: input.probability,
      closeDate: input.closeDate,
      lastActivityDate: "2026-09-08",
      source: "job-board",
      priority: input.priority,
      nextStep: "—",
    }
    set((state) => ({
      opportunities: [...state.opportunities, newOpp],
      savingIds: [...state.savingIds, id],
    }))
    try {
      await simulateWrite(true)
      set((state) => ({ savingIds: state.savingIds.filter((x) => x !== id) }))
      get().pushToast("success", t(get().language).opportunityCreated)
      return id
    } catch {
      set((state) => ({
        opportunities: state.opportunities.filter((o) => o.id !== id),
        savingIds: state.savingIds.filter((x) => x !== id),
      }))
      get().pushToast("error", t(get().language).createFailed)
      return null
    }
  },

  duplicateOpportunity: (id) => {
    const opp = get().opportunities.find((o) => o.id === id)
    if (!opp) return
    const newId = genId(get().opportunities)
    const copy: Opportunity = { ...opp, id: newId, name: `${opp.name} (Copy)`, restricted: false }
    set((state) => ({ opportunities: [...state.opportunities, copy] }))
    get().pushToast("success", t(get().language).opportunityDuplicated)
  },

  deleteOpportunity: (id) => {
    const opp = get().opportunities.find((o) => o.id === id)
    if (!opp) return
    if (!canEditOpportunity(opp)) {
      get().pushToast("error", t(get().language).permissionDenied(t(get().language).actionDeleteVerb))
      return
    }
    if (get().openDrawerId === id) set({ openDrawerId: null })
    applyOptimisticDelete(set, get, [id]).then((failed) => {
      if (failed.length) get().pushToast("error", t(get().language).deleteFailed)
      else get().pushToast("success", t(get().language).opportunityDeleted)
    })
  },

  bulkUpdatePriority: (ids, priority) => {
    const lang = get().language
    runBulkOp(
      set,
      get,
      "priority",
      ids,
      t(lang).permissionDenied(t(lang).actionAssignVerb),
      t(lang).saveFailed,
      (editableIds) => applyOptimisticPatch(set, get, editableIds, { priority })
    )
  },

  bulkUpdateOwner: (ids, owner) => {
    const lang = get().language
    runBulkOp(
      set,
      get,
      "owner",
      ids,
      t(lang).permissionDenied(t(lang).actionAssignVerb),
      t(lang).saveFailed,
      (editableIds) =>
        applyOptimisticPatch(set, get, editableIds, {
          owner,
          ownerInitials: initialsFromName(owner),
          ownerAvatar: avatarForOwnerName(owner),
        })
    )
  },

  bulkChangeStage: (ids, toStage) => {
    const { opportunities, language } = get()
    const denied: string[] = []
    const rejected: string[] = []
    const needsReason: string[] = []
    const okNow: string[] = []
    let fromStageForReason: Stage | null = null

    for (const id of ids) {
      const opp = opportunities.find((o) => o.id === id)
      if (!opp || opp.stage === toStage) continue
      if (!canEditOpportunity(opp)) {
        denied.push(id)
        continue
      }
      const outcome = validateStageMove(opp, toStage, language)
      if (outcome.kind === "rejected") rejected.push(id)
      else if (outcome.kind === "needs-reason") {
        needsReason.push(id)
        fromStageForReason = opp.stage
      } else okNow.push(id)
    }

    const denyMsg = t(language).permissionDenied(t(language).actionMoveVerb)
    const failMsg = t(language).saveFailed

    if (okNow.length) {
      applyOptimisticPatch(set, get, okNow, { stage: toStage, lastActivityDate: "2026-09-08" }).then(
        (failedWrites) =>
          reportOutcome(
            set,
            get,
            "stage",
            [...okNow, ...denied, ...rejected],
            denied,
            [...rejected, ...failedWrites],
            denyMsg,
            failMsg
          )
      )
    } else if (denied.length || rejected.length) {
      reportOutcome(set, get, "stage", [...denied, ...rejected], denied, rejected, denyMsg, failMsg)
    }

    if (needsReason.length && fromStageForReason) {
      set({ pendingLostConfirmation: { oppIds: needsReason, fromStage: fromStageForReason } })
    }
  },

  bulkDelete: (ids) => {
    const lang = get().language
    runBulkOp(
      set,
      get,
      "delete",
      ids,
      t(lang).permissionDenied(t(lang).actionDeleteVerb),
      t(lang).deleteFailed,
      (editableIds) => applyOptimisticDelete(set, get, editableIds)
    )
  },
}))

export function selectVisibleOpportunities(state: OpportunitiesState): Opportunity[] {
  let items = state.opportunities

  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase()
    items = items.filter((o) => {
      const stageLabel = STAGE_MAP[o.stage].label.toLowerCase()
      return (
        o.name.toLowerCase().includes(q) ||
        o.account.toLowerCase().includes(q) ||
        o.contact.toLowerCase().includes(q) ||
        o.owner.toLowerCase().includes(q) ||
        stageLabel.includes(q)
      )
    })
  }
  if (state.ownerFilter !== "all") items = items.filter((o) => o.owner === state.ownerFilter)
  if (state.priorityFilter !== "all") items = items.filter((o) => o.priority === state.priorityFilter)
  if (state.sourceFilter !== "all") items = items.filter((o) => o.source === state.sourceFilter)
  if (state.statusFilter === "open")
    items = items.filter((o) => o.stage !== "hired" && o.stage !== "rejected")
  else if (state.statusFilter === "won") items = items.filter((o) => o.stage === "hired")
  else if (state.statusFilter === "lost") items = items.filter((o) => o.stage === "rejected")

  const dir = state.sortDir === "asc" ? 1 : -1
  items = [...items].sort((a, b) => {
    const field = state.sortField
    if (field === "custom") {
      const order = state.manualOrder
      const rankA = order.indexOf(a.id)
      const rankB = order.indexOf(b.id)
      return (rankA === -1 ? Number.MAX_SAFE_INTEGER : rankA) - (rankB === -1 ? Number.MAX_SAFE_INTEGER : rankB)
    }
    if (field === "amount" || field === "probability") return (a[field] - b[field]) * dir
    if (field === "closeDate") return a.closeDate.localeCompare(b.closeDate) * dir
    if (field === "stage") return (stageIndex(a.stage) - stageIndex(b.stage)) * dir
    return a[field].localeCompare(b[field]) * dir
  })

  return items
}

export { stageIndex }
