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

const POSITIONS = [
  "Senior Backend Engineer", "Product Manager", "UX Designer", "Data Analyst", "DevOps Engineer",
  "Customer Success Manager", "Sales Development Representative", "Marketing Specialist", "QA Engineer",
  "Frontend Developer", "HR Business Partner", "Financial Analyst", "Operations Manager",
  "Technical Support Specialist", "Business Development Manager", "Content Strategist",
  "Solutions Architect", "Mobile Engineer (iOS)", "Mobile Engineer (Android)", "Security Engineer",
  "Data Scientist", "Executive Assistant", "Legal Counsel", "Supply Chain Analyst",
]

const CANDIDATE_NAMES = [
  "Amal Hassan", "David Okoro", "Priya Nair", "Yusuf Al-Sayed", "Hana Kobayashi", "Liam Fitzgerald",
  "Fatima Al-Zahra", "Marco Rossi", "Aisha Rahman", "Tom Whitfield", "Noor Abdullah", "Elena Petrova",
  "Rashid Al-Mansoori", "Grace Chen", "Samir Iqbal", "Olivia Bennett",
]

/** A stable, plausible email derived from the candidate's name — not a real address. */
function emailFor(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s-]/g, "")
    .trim()
    .split(/\s+/)
    .join(".")
  return `${slug}@candidatemail.com`
}

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

const SOURCES: Source[] = ["referral", "job-board", "agency", "linkedin"]
const PRIORITIES: Priority[] = ["low", "medium", "high"]

const NEXT_STEPS = [
  "Schedule technical interview", "Send take-home assignment", "Conduct reference check",
  "Schedule panel interview", "Prepare offer letter", "Await candidate decision",
  "Schedule culture-fit interview", "Confirm salary expectations", "Run background check",
  "Schedule onboarding call",
]

const REJECTION_REASONS = [
  "Accepted another offer", "Compensation mismatch", "Failed technical assessment", "Position put on hold",
]

function daysFromNow(days: number) {
  const d = new Date("2026-09-08")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Realistic, uneven distribution across the pipeline — heavier at the top,
// thinning out toward close, matching the shape referenced in the module brief.
const STAGE_COUNTS: Record<Stage, number> = {
  applied: 13,
  screening: 10,
  "interview-scheduled": 8,
  "interview-completed": 7,
  "offer-extended": 5,
  hired: 4,
  rejected: 3,
}

let idCounter = 1
function makeOpportunity(stage: Stage): Opportunity {
  const candidate = pick(CANDIDATE_NAMES)
  const owner = pick(OWNERS)
  const isClosed = stage === "hired" || stage === "rejected"
  const probabilityByStage: Record<Stage, number> = {
    applied: 10,
    screening: 25,
    "interview-scheduled": 40,
    "interview-completed": 60,
    "offer-extended": 80,
    hired: 100,
    rejected: 0,
  }
  const id = `CAND-${String(idCounter++).padStart(4, "0")}`
  return {
    id,
    name: candidate,
    account: pick(POSITIONS),
    contact: emailFor(candidate),
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
    lostReason: stage === "rejected" ? pick(REJECTION_REASONS) : undefined,
    // Deterministic ~1-in-9 split so permission-denied paths are reachable in the demo.
    restricted: idCounter % 9 === 0,
  }
}

export const OPPORTUNITIES: Opportunity[] = (Object.entries(STAGE_COUNTS) as [Stage, number][]).flatMap(
  ([stage, count]) => Array.from({ length: count }, () => makeOpportunity(stage))
)

export const OWNER_NAMES = OWNERS.map((o) => o.name).sort()
export const POSITION_NAMES = [...POSITIONS].sort()
