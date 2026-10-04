import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  STAGES,
  type Priority,
  type Stage,
  type EducationDetails,
  type CareerDetails,
  type CandidateStatus,
} from "@/data/types"
import { OWNER_NAMES, POSITION_NAMES, avatarForOwnerName } from "@/data/opportunities"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useOpportunitiesStore } from "@/store/opportunities-store"

const PRIORITY_LABEL: Record<Priority, { en: string; ar: string }> = {
  high: { en: "High", ar: "مرتفعة" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
}

const DEGREES = ["High School", "Diploma", "Bachelor's", "Master's", "PhD"]
const NOTICE_PERIODS = ["Immediate", "2 Weeks", "1 Month", "2 Months", "3 Months"]

const EMPTY_EDUCATION: EducationDetails = {
  degree: "",
  fieldOfStudy: "",
  institution: "",
  graduationYear: "",
}

const EMPTY_CAREER: CareerDetails = {
  currentEmployer: "",
  currentTitle: "",
  yearsOfExperience: "",
  noticePeriod: "",
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

function Field({
  id,
  label,
  full,
  children,
}: {
  id: string
  label: string
  full?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={full ? "col-span-full grid gap-1.5" : "grid gap-1.5"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

interface BasicFormValues {
  name: string
  account: string
  stage: Stage
  priority: Priority
  amount: string
  probability: string
  closeDate: string
  owner: string
  status: CandidateStatus
}

function StatusToggle({
  value,
  onChange,
  activeLabel,
  inactiveLabel,
}: {
  value: CandidateStatus
  onChange: (v: CandidateStatus) => void
  activeLabel: string
  inactiveLabel: string
}) {
  const isActive = value === "active"
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      onClick={() => onChange(isActive ? "inactive" : "active")}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "bg-success/15 text-success hover:bg-success/20"
          : "bg-muted text-muted-foreground hover:bg-muted/70"
      )}
    >
      <span className={cn("size-1.5 rounded-full", isActive ? "bg-success" : "bg-muted-foreground/50")} />
      {isActive ? activeLabel : inactiveLabel}
    </button>
  )
}

export function CandidateProfilePage() {
  const { profileCandidateId, closeCandidateProfile, opportunities, updateOpportunity, language } =
    useOpportunitiesStore()
  const s = t(language)
  const opp = opportunities.find((o) => o.id === profileCandidateId)

  const [basic, setBasic] = useState<BasicFormValues | null>(null)
  const [education, setEducation] = useState<EducationDetails>(EMPTY_EDUCATION)
  const [career, setCareer] = useState<CareerDetails>(EMPTY_CAREER)

  // Re-sync local form state whenever the page switches to a different candidate.
  useEffect(() => {
    if (!opp) return
    setBasic({
      name: opp.name,
      account: opp.account,
      stage: opp.stage,
      priority: opp.priority,
      amount: String(opp.amount),
      probability: String(opp.probability),
      closeDate: opp.closeDate,
      owner: opp.owner,
      status: opp.status ?? "active",
    })
    setEducation(opp.education ?? EMPTY_EDUCATION)
    setCareer(opp.career ?? EMPTY_CAREER)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opp?.id])

  if (!opp || !basic) return null

  function saveAll() {
    if (!opp || !basic) return
    updateOpportunity(opp.id, {
      name: basic.name.trim(),
      account: basic.account,
      stage: basic.stage,
      priority: basic.priority,
      amount: Number(basic.amount) || 0,
      probability: Number(basic.probability) || 0,
      closeDate: basic.closeDate,
      owner: basic.owner,
      status: basic.status,
      education,
      career,
    })
    closeCandidateProfile()
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={closeCandidateProfile}>
          <ArrowLeft className="size-4" /> {s.backToCandidates}
        </Button>
        <div className="flex items-center gap-2">
          <StatusToggle
            value={basic.status}
            onChange={(v) => setBasic({ ...basic, status: v })}
            activeLabel={s.statusActive}
            inactiveLabel={s.statusInactive}
          />
          <Button variant="outline" onClick={closeCandidateProfile}>
            {s.cancel}
          </Button>
          <Button onClick={saveAll}>{s.save}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={avatarForOwnerName(opp.owner)} alt="" />
          <AvatarFallback>{opp.ownerInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground">{opp.name}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {opp.account} · {opp.id}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 pb-10">
        <SectionCard title={s.basicDetailsTitle}>
          <Field id="profile-name" label={s.name} full>
            <Input
              id="profile-name"
              value={basic.name}
              onChange={(e) => setBasic({ ...basic, name: e.target.value })}
            />
          </Field>
          <Field id="profile-account" label={s.account}>
            <Select value={basic.account} onValueChange={(v) => setBasic({ ...basic, account: v })}>
              <SelectTrigger id="profile-account" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITION_NAMES.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="profile-owner" label={s.ownerCol}>
            <Select value={basic.owner} onValueChange={(v) => setBasic({ ...basic, owner: v })}>
              <SelectTrigger id="profile-owner" className="w-full">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <Avatar className="size-5">
                      <AvatarImage src={avatarForOwnerName(basic.owner)} alt="" />
                      <AvatarFallback className="text-[9px]">
                        {basic.owner
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {basic.owner}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {OWNER_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="profile-stage" label={s.stage}>
            <Select value={basic.stage} onValueChange={(v) => setBasic({ ...basic, stage: v as Stage })}>
              <SelectTrigger id="profile-stage" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {language === "ar" ? st.labelAr : st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="profile-priority" label={s.priority}>
            <Select
              value={basic.priority}
              onValueChange={(v) => setBasic({ ...basic, priority: v as Priority })}
            >
              <SelectTrigger id="profile-priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_LABEL[p][language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="profile-amount" label={s.amount}>
            <Input
              id="profile-amount"
              type="number"
              min={0}
              value={basic.amount}
              onChange={(e) => setBasic({ ...basic, amount: e.target.value })}
            />
          </Field>
          <Field id="profile-probability" label={s.probability}>
            <Input
              id="profile-probability"
              type="number"
              min={0}
              max={100}
              value={basic.probability}
              onChange={(e) => setBasic({ ...basic, probability: e.target.value })}
            />
          </Field>
          <Field id="profile-close-date" label={s.closeDate} full>
            <Input
              id="profile-close-date"
              type="date"
              value={basic.closeDate}
              onChange={(e) => setBasic({ ...basic, closeDate: e.target.value })}
            />
          </Field>
        </SectionCard>

        <SectionCard title={s.educationDetailsTitle}>
          <Field id="profile-degree" label={s.degree}>
            <Select
              value={education.degree}
              onValueChange={(v) => setEducation({ ...education, degree: v })}
            >
              <SelectTrigger id="profile-degree" className="w-full">
                <SelectValue placeholder={s.degree} />
              </SelectTrigger>
              <SelectContent>
                {DEGREES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="profile-field-of-study" label={s.fieldOfStudy}>
            <Input
              id="profile-field-of-study"
              value={education.fieldOfStudy}
              onChange={(e) => setEducation({ ...education, fieldOfStudy: e.target.value })}
            />
          </Field>
          <Field id="profile-institution" label={s.institution}>
            <Input
              id="profile-institution"
              value={education.institution}
              onChange={(e) => setEducation({ ...education, institution: e.target.value })}
            />
          </Field>
          <Field id="profile-graduation-year" label={s.graduationYear}>
            <Input
              id="profile-graduation-year"
              type="number"
              value={education.graduationYear}
              onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
            />
          </Field>
        </SectionCard>

        <SectionCard title={s.careerDetailsTitle}>
          <Field id="profile-current-employer" label={s.currentEmployer}>
            <Input
              id="profile-current-employer"
              value={career.currentEmployer}
              onChange={(e) => setCareer({ ...career, currentEmployer: e.target.value })}
            />
          </Field>
          <Field id="profile-current-title" label={s.currentTitle}>
            <Input
              id="profile-current-title"
              value={career.currentTitle}
              onChange={(e) => setCareer({ ...career, currentTitle: e.target.value })}
            />
          </Field>
          <Field id="profile-years-experience" label={s.yearsOfExperience}>
            <Input
              id="profile-years-experience"
              type="number"
              min={0}
              value={career.yearsOfExperience}
              onChange={(e) => setCareer({ ...career, yearsOfExperience: e.target.value })}
            />
          </Field>
          <Field id="profile-notice-period" label={s.noticePeriod}>
            <Select
              value={career.noticePeriod}
              onValueChange={(v) => setCareer({ ...career, noticePeriod: v })}
            >
              <SelectTrigger id="profile-notice-period" className="w-full">
                <SelectValue placeholder={s.noticePeriod} />
              </SelectTrigger>
              <SelectContent>
                {NOTICE_PERIODS.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </SectionCard>
      </div>
    </div>
  )
}
