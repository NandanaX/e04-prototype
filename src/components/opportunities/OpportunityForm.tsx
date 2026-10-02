import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { STAGES, type Priority, type Stage } from "@/data/types"
import { OWNER_NAMES, avatarForOwnerName } from "@/data/opportunities"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore, type NewOpportunityInput } from "@/store/opportunities-store"

const PRIORITY_LABEL: Record<Priority, { en: string; ar: string }> = {
  high: { en: "High", ar: "مرتفعة" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
}

interface FormValues {
  name: string
  account: string
  stage: Stage
  priority: Priority
  amount: string
  probability: string
  closeDate: string
  owner: string
}

const EMPTY: FormValues = {
  name: "",
  account: "",
  stage: "prospecting",
  priority: "medium",
  amount: "",
  probability: "",
  closeDate: "",
  owner: OWNER_NAMES[0],
}

export function OpportunityForm() {
  const { formState, closeForm, createOpportunity, updateOpportunity, opportunities, language } =
    useOpportunitiesStore()
  const s = t(language)
  const isOpen = !!formState
  const isEdit = formState?.mode === "edit"

  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!formState) return
    if (formState.mode === "edit") {
      const opp = opportunities.find((o) => o.id === formState.editId)
      if (opp) {
        setValues({
          name: opp.name,
          account: opp.account,
          stage: opp.stage,
          priority: opp.priority,
          amount: String(opp.amount),
          probability: String(opp.probability),
          closeDate: opp.closeDate,
          owner: opp.owner,
        })
      }
    } else {
      setValues({ ...EMPTY, stage: formState.prefillStage ?? "prospecting" })
    }
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState])

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {}
    if (!values.name.trim()) next.name = s.fieldRequired
    if (!values.account.trim()) next.account = s.fieldRequired
    const amountNum = Number(values.amount)
    if (!values.amount || Number.isNaN(amountNum) || amountNum <= 0) next.amount = s.fieldValuePositive
    const probNum = Number(values.probability)
    if (values.probability === "" || Number.isNaN(probNum) || probNum < 0 || probNum > 100)
      next.probability = s.fieldProbabilityRange
    if (!values.closeDate) next.closeDate = s.fieldRequired
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const input: NewOpportunityInput = {
      name: values.name.trim(),
      account: values.account.trim(),
      stage: values.stage,
      priority: values.priority,
      amount: Number(values.amount),
      probability: Number(values.probability),
      closeDate: values.closeDate,
      owner: values.owner,
    }
    setSubmitting(true)
    if (isEdit && formState?.mode === "edit") {
      updateOpportunity(formState.editId, input)
      setSubmitting(false)
      closeForm()
      return
    }
    const ok = await createOpportunity(input)
    setSubmitting(false)
    if (ok) closeForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? s.editOpportunityTitle : s.addOpportunity}</DialogTitle>
          <DialogDescription>
            {formState?.mode === "create" && formState.prefillStage
              ? `${s.stage}: ${STAGES.find((st) => st.id === formState.prefillStage)?.[language === "ar" ? "labelAr" : "label"]}`
              : null}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="opp-name">{s.name}</Label>
            <Input id="opp-name" value={values.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p className="text-2xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="opp-account">{s.account}</Label>
            <Input
              id="opp-account"
              value={values.account}
              onChange={(e) => set("account", e.target.value)}
            />
            {errors.account && <p className="text-2xs text-destructive">{errors.account}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>{s.stage}</Label>
              <Select value={values.stage} onValueChange={(v) => set("stage", v as Stage)}>
                <SelectTrigger className="w-full">
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
            </div>
            <div className="grid gap-1.5">
              <Label>{s.priority}</Label>
              <Select value={values.priority} onValueChange={(v) => set("priority", v as Priority)}>
                <SelectTrigger className="w-full">
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="opp-amount">{s.amount}</Label>
              <Input
                id="opp-amount"
                type="number"
                min={0}
                value={values.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
              {errors.amount && <p className="text-2xs text-destructive">{errors.amount}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="opp-probability">{s.probability}</Label>
              <Input
                id="opp-probability"
                type="number"
                min={0}
                max={100}
                value={values.probability}
                onChange={(e) => set("probability", e.target.value)}
              />
              {errors.probability && <p className="text-2xs text-destructive">{errors.probability}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="opp-close-date">{s.closeDate}</Label>
              <Input
                id="opp-close-date"
                type="date"
                value={values.closeDate}
                onChange={(e) => set("closeDate", e.target.value)}
              />
              {errors.closeDate && <p className="text-2xs text-destructive">{errors.closeDate}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>{s.ownerCol}</Label>
              <Select value={values.owner} onValueChange={(v) => set("owner", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={avatarForOwnerName(values.owner)} alt="" />
                        <AvatarFallback className="text-[9px]">
                          {values.owner
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {values.owner}
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
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeForm} disabled={submitting}>
            {s.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (isEdit ? s.saving : s.creating) : isEdit ? s.save : s.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
