import type { Opportunity, Priority, Source, Stage } from "./types"

// Deterministic PRNG so the mock dataset is stable across reloads/builds.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260908)
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]
const int = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1))

const ACCOUNTS = [
  "Meridian Logistics", "Al Fahad Holdings", "Crestpoint Retail Group", "Northgate Manufacturing",
  "Sundara Textiles", "Oryx Energy Services", "BluePeak Software", "Falcon Bay Shipping",
  "Rivermark Insurance", "Silverline Hospitality", "Ashford Capital Partners", "Cedarwood Health Systems",
  "Talisman Media Group", "Harborview Construction", "Nexora Telecom", "Golden Dune Real Estate",
  "Pinnacle Foods Co.", "Zephyr Airlines", "Cobalt Data Systems", "Marlow & Finch Legal",
  "Coral Reef Resorts", "Ironclad Security", "Vantage Point Consulting", "Lumen Analytics",
]

const CONTACTS = [
  "Amal Hassan", "David Okoro", "Priya Nair", "Yusuf Al-Sayed", "Hana Kobayashi", "Liam Fitzgerald",
  "Fatima Al-Zahra", "Marco Rossi", "Aisha Rahman", "Tom Whitfield", "Noor Abdullah", "Elena Petrova",
  "Rashid Al-Mansoori", "Grace Chen", "Samir Iqbal", "Olivia Bennett",
]

// Real headshot photos from pravatar.cc (a public placeholder-avatar service — not
// real OSOS employees) — the `u=` seed just makes each owner's photo stable across
// the whole app instead of changing on every render.
function avatarFor(seed: string) {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`
}

const OWNERS = [
  { name: "Layla Haddad", initials: "LH", avatar: avatarFor("layla-haddad-osos") },
  { name: "Kevin Park", initials: "KP", avatar: avatarFor("kevin-park-osos") },
  { name: "Nadia Farouk", initials: "NF", avatar: avatarFor("nadia-farouk-osos") },
  { name: "James Whitmore", initials: "JW", avatar: avatarFor("james-whitmore-osos") },
  { name: "Sara Al-Amin", initials: "SA", avatar: avatarFor("sara-al-amin-osos") },
]

const OWNER_BY_NAME = new Map(OWNERS.map((o) => [o.name, o]))

/** Looks up the stable avatar for a known owner name, or derives a stable one for a new/renamed owner. */
export function avatarForOwnerName(name: string): string {
  return OWNER_BY_NAME.get(name)?.avatar ?? avatarFor(name)
}

const SOURCES: Source[] = ["referral", "inbound", "outbound", "partner"]
const PRIORITIES: Priority[] = ["low", "medium", "high"]

const NEXT_STEPS = [
  "Send updated pricing", "Schedule technical demo", "Follow up after trial", "Confirm procurement timeline",
  "Loop in legal for redlines", "Await signed PO", "Re-engage after budget cycle", "Share case study",
  "Book executive sponsor call", "Confirm implementation start date",
]

const LOST_REASONS = [
  "Went with incumbent vendor", "Budget frozen this cycle", "Chose lower-cost competitor", "Project shelved internally",
]

function daysFromNow(days: number) {
  const d = new Date("2026-09-08")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Realistic, uneven distribution across the pipeline — heavier at the top,
// thinning out toward close, matching the shape referenced in the module brief.
const STAGE_COUNTS: Record<Stage, number> = {
  prospecting: 13,
  qualification: 10,
  "needs-analysis": 8,
  proposal: 7,
  negotiation: 5,
  "closed-won": 4,
  "closed-lost": 3,
}

let idCounter = 1
function makeOpportunity(stage: Stage): Opportunity {
  const account = pick(ACCOUNTS)
  const owner = pick(OWNERS)
  const isClosed = stage === "closed-won" || stage === "closed-lost"
  const probabilityByStage: Record<Stage, number> = {
    prospecting: 10,
    qualification: 25,
    "needs-analysis": 40,
    proposal: 60,
    negotiation: 80,
    "closed-won": 100,
    "closed-lost": 0,
  }
  const id = `OPP-${String(idCounter++).padStart(4, "0")}`
  return {
    id,
    name: `${account} – ${pick(["Platform renewal", "New deployment", "Expansion", "Pilot rollout", "Annual contract", "Multi-site rollout"])}`,
    account,
    contact: pick(CONTACTS),
    owner: owner.name,
    ownerInitials: owner.initials,
    ownerAvatar: owner.avatar,
    stage,
    amount: int(8, 220) * 1000,
    currency: "USD",
    probability: probabilityByStage[stage],
    closeDate: daysFromNow(isClosed ? int(-30, -1) : int(3, 90)),
    lastActivityDate: daysFromNow(int(-14, 0)),
    source: pick(SOURCES),
    priority: pick(PRIORITIES),
    nextStep: isClosed ? "—" : pick(NEXT_STEPS),
    lostReason: stage === "closed-lost" ? pick(LOST_REASONS) : undefined,
    // Deterministic ~1-in-9 split so permission-denied paths are reachable in the demo.
    restricted: idCounter % 9 === 0,
  }
}

export const OPPORTUNITIES: Opportunity[] = (Object.entries(STAGE_COUNTS) as [Stage, number][]).flatMap(
  ([stage, count]) => Array.from({ length: count }, () => makeOpportunity(stage))
)

export const OWNER_NAMES = OWNERS.map((o) => o.name).sort()
