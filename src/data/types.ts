export type Stage =
  | "applied"
  | "screening"
  | "interview-scheduled"
  | "interview-completed"
  | "offer-extended"
  | "hired"
  | "rejected"

export interface StageDef {
  id: Stage
  label: string
  labelAr: string
  /** Closed stages require extra confirmation before a drop is accepted. */
  closed?: boolean
}

export type Source = "referral" | "job-board" | "agency" | "linkedin"
export type Priority = "low" | "medium" | "high"
export type CandidateStatus = "active" | "inactive"

export interface EducationDetails {
  degree: string
  fieldOfStudy: string
  institution: string
  graduationYear: string
}

export interface CareerDetails {
  currentEmployer: string
  currentTitle: string
  yearsOfExperience: string
  noticePeriod: string
}

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
  /** Filled in on the candidate profile page — absent until the recruiter adds it. */
  education?: EducationDetails
  career?: CareerDetails
  /** Whether the candidate's application is still active; defaults to "active". */
  status?: CandidateStatus
}

export const STAGES: StageDef[] = [
  { id: "applied", label: "Applied", labelAr: "تم التقديم" },
  { id: "screening", label: "Screening", labelAr: "الفرز" },
  { id: "interview-scheduled", label: "Interview Scheduled", labelAr: "مقابلة مجدولة" },
  { id: "interview-completed", label: "Interview Completed", labelAr: "اكتملت المقابلة" },
  { id: "offer-extended", label: "Offer Extended", labelAr: "تم تقديم العرض" },
  { id: "hired", label: "Hired", labelAr: "تم التوظيف", closed: true },
  { id: "rejected", label: "Rejected", labelAr: "مرفوض", closed: true },
]

export const STAGE_MAP: Record<Stage, StageDef> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
) as Record<Stage, StageDef>
