export type Stage =
  | "prospecting"
  | "qualification"
  | "needs-analysis"
  | "proposal"
  | "negotiation"
  | "closed-won"
  | "closed-lost"

export interface StageDef {
  id: Stage
  label: string
  labelAr: string
  /** Closed stages require extra confirmation before a drop is accepted. */
  closed?: boolean
}

export type Source = "referral" | "inbound" | "outbound" | "partner"
export type Priority = "low" | "medium" | "high"

export interface Opportunity {
  id: string
  name: string
  account: string
  contact: string
  owner: string
  ownerInitials: string
  ownerAvatar: string
  stage: Stage
  amount: number
  currency: "USD"
  probability: number
  closeDate: string
  lastActivityDate: string
  source: Source
  priority: Priority
  nextStep: string
  lostReason?: string
  /** Demo permission flag — the current mock user cannot edit/move/delete this record. */
  restricted?: boolean
}

export const STAGES: StageDef[] = [
  { id: "prospecting", label: "Prospecting", labelAr: "استكشاف" },
  { id: "qualification", label: "Qualification", labelAr: "التأهيل" },
  { id: "needs-analysis", label: "Needs Analysis", labelAr: "تحليل الاحتياجات" },
  { id: "proposal", label: "Proposal / Quote Sent", labelAr: "تم إرسال العرض" },
  { id: "negotiation", label: "Negotiation", labelAr: "التفاوض" },
  { id: "closed-won", label: "Closed – Won", labelAr: "مغلق – فوز", closed: true },
  { id: "closed-lost", label: "Closed – Lost", labelAr: "مغلق – خسارة", closed: true },
]

export const STAGE_MAP: Record<Stage, StageDef> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
) as Record<Stage, StageDef>
