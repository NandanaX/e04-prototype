# E-04 — CRM Opportunities multi-view prototype

A coded companion to the Day 1–2 Word doc: a real React app implementing the
List / Card / Kanban framework rules against the CRM Opportunities module,
built with **Vite + React + TypeScript + Tailwind v4 + shadcn/ui**.

This is a prototype for exploring and defending the interaction design — not
a production build. Field names, stage names, and all records are **mock
data** (see "What's fake" below).

## Run it

```bash
pnpm install
pnpm dev
```

Requires Node 18+ and `pnpm` (`npm install -g pnpm` if you don't have it).
`pnpm build` produces a production bundle in `dist/`; `pnpm exec tsc -b --noEmit`
type-checks without emitting.

## What's implemented

- **View switcher** — segmented control (List / Card / Kanban) in the
  toolbar. The current view is written into the URL hash (`#list`, `#card`,
  `#kanban`), so a refresh or a shared link returns to the same view.
- **State preservation across views** — filters (owner, priority), search,
  sort, and multi-select selection are held in one shared store
  (`src/store/opportunities-store.ts`) and read by all three views, so
  switching views never resets them. Selection persists by record id, not
  row position — try selecting two rows in List, then switching to Card.
- **List view** — sortable table, row selection, bulk-action bar.
- **Card view** — responsive card grid, same card anatomy reused inside
  Kanban (density prop: `comfortable` vs `compact`).
- **Kanban view** — one column per stage, drag-and-drop via `@dnd-kit`
  (pointer **and** keyboard sensors — tab to a card, arrow keys + space to
  move it), column totals, per-column lazy loading ("Load more"), and an
  empty-column state.
- **Drop validation** — a drag is a *proposed* move, validated before
  anything writes back (see `attemptMoveStage` in the store):
  - Dragging a **closed** opportunity anywhere is blocked outright (reopen
    from the record, not by dragging).
  - Dragging straight to **Closed – Won** from anywhere but Negotiation is
    blocked (no skipping stages).
  - Dragging to **Closed – Lost** is allowed but requires a reason first —
    a dialog blocks the write until one is entered, mirroring the
    required-property prompt HubSpot uses (see the Day 1–2 doc's competitor
    comparison).
- **RTL** — a language toggle in the toolbar flips `dir` on `<html>` to
  `rtl` and switches all UI strings and stage names to Arabic
  (`src/lib/i18n.ts`). Tailwind logical properties (`ps-`, `pe-`, `ms-`,
  `text-end`, etc.) are used throughout instead of `left`/`right` so the
  whole layout — including the Kanban column order — mirrors correctly.
- **Accessibility** — visible focus rings (shadcn defaults), keyboard drag
  in Kanban, labelled checkboxes, dialogs trap focus (Radix).

## What's fake — replace before this counts as real deliverable content

The brief requires real field labels, real statuses, and real record
volumes. This prototype currently uses:

- `src/data/types.ts` — a 7-stage pipeline (Prospecting → Qualification →
  Needs Analysis → Proposal → Negotiation → Closed-Won/Lost) and a generic
  field set. Swap in OSOS's actual CRM Opportunities stages and fields.
- `src/data/opportunities.ts` — ~50 deterministically-generated mock
  opportunities (fake company names, fake owners) with an intentionally
  uneven stage distribution. Swap in a real export, or at minimum real
  volumes per stage.

Everything else — the store, the view components, the drag rules, the i18n
setup — is written against the `Opportunity` / `Stage` types, so swapping
the data source shouldn't require touching the components.

## Project structure

```
src/
  components/ui/            shadcn/ui primitives (Button, Card, Table, Dialog, …)
  components/opportunities/ Toolbar, SelectionBar, ListView, CardView, KanbanView,
                             OpportunityCard (shared), DropDialogs, badges
  data/                      types + mock dataset
  lib/                       cn() helper, i18n strings + formatters
  store/                     zustand store — the framework rules live here
```

## Notes on the shadcn/ui setup

`shadcn`'s CLI (`shadcn init`) fetches its registry from `ui.shadcn.com` at
run time, which wasn't reachable from the sandbox this was built in — so the
`src/components/ui/*` files here were pulled directly from the
`shadcn-ui/ui` GitHub repo's `apps/v4/registry/new-york-v4/ui` source
(same components the CLI would generate: `new-york-v4` style, Radix base,
neutral color) and the import paths adjusted to this project's
`@/components/ui/*` alias. `components.json` is included so
`pnpm dlx shadcn@latest add <component>` should work normally for adding
more components once you have normal network access.
