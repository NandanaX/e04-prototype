import { ExternalLink, Pencil, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { formatCurrency, t } from "@/lib/i18n"
import { canEditOpportunity, useOpportunitiesStore } from "@/store/opportunities-store"

const PRIORITY_LABEL: Record<Priority, { en: string; ar: string }> = {
  high: { en: "High", ar: "مرتفعة" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-2xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function OpportunityDrawer() {
  const {
    openDrawerId,
    closeDrawer,
    opportunities,
    language,
    attemptMoveStage,
    updatePriority,
    updateOwner,
    updateProbability,
    updateCloseDate,
    openEditForm,
    requestDelete,
    savingIds,
  } = useOpportunitiesStore()
  const s = t(language)
  const opp = opportunities.find((o) => o.id === openDrawerId)

  // Opening/closing the drawer only touches this piece of state — it never
  // resets search, filters, sort, view, Kanban scroll, or selection.
  return (
    <Sheet open={!!opp} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent>
        {opp && (
          <>
            <SheetHeader>
              <SheetTitle className="truncate">{opp.name}</SheetTitle>
              <SheetDescription className="truncate">{opp.account}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-4">
              {!canEditOpportunity(opp) && (
                <div className="rounded-md bg-warning/10 px-3 py-2 text-2xs text-warning">
                  {s.permissionDenied(s.actionEditVerb)}
                </div>
              )}
              {savingIds.includes(opp.id) && (
                <div className="text-2xs text-muted-foreground">{s.saving}</div>
              )}

              <Field label={s.stage}>
                <Select
                  value={opp.stage}
                  onValueChange={(v) => attemptMoveStage(opp.id, v as Stage)}
                  disabled={!canEditOpportunity(opp)}
                >
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
              </Field>

              <Field label={s.priority}>
                <Select
                  value={opp.priority}
                  onValueChange={(v) => updatePriority(opp.id, v as Priority)}
                  disabled={!canEditOpportunity(opp)}
                >
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
              </Field>

              <Field label={s.amount}>
                <div className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(opp.amount, language)}
                </div>
              </Field>

              <Field label={s.probability}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={opp.probability}
                  disabled={!canEditOpportunity(opp)}
                  onBlur={(e) => {
                    const n = Number(e.target.value)
                    if (!Number.isNaN(n) && n !== opp.probability) updateProbability(opp.id, n)
                  }}
                />
              </Field>

              <Field label={s.closeDate}>
                <Input
                  type="date"
                  defaultValue={opp.closeDate}
                  disabled={!canEditOpportunity(opp)}
                  onChange={(e) => {
                    if (e.target.value) updateCloseDate(opp.id, e.target.value)
                  }}
                />
              </Field>

              <Field label={s.ownerCol}>
                <Select
                  value={opp.owner}
                  onValueChange={(v) => updateOwner(opp.id, v)}
                  disabled={!canEditOpportunity(opp)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarImage src={opp.ownerAvatar} alt="" />
                          <AvatarFallback className="text-2xs">{opp.ownerInitials}</AvatarFallback>
                        </Avatar>
                        {opp.owner}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {OWNER_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        <span className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarImage src={avatarForOwnerName(name)} alt="" />
                            <AvatarFallback className="text-2xs">
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
              </Field>

              {opp.nextStep !== "—" && <Field label={s.nextStep}>{opp.nextStep}</Field>}
              {opp.lostReason && <Field label={s.lostReasonTitle}>{opp.lostReason}</Field>}
            </SheetBody>

            <SheetFooter className="justify-between">
              <Button
                variant="destructive"
                size="sm"
                disabled={!canEditOpportunity(opp)}
                onClick={() => requestDelete([opp.id])}
              >
                <Trash2 /> {s.deleteAction}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canEditOpportunity(opp)}
                  onClick={() => openEditForm(opp.id)}
                  title={s.drawerOpenFull}
                >
                  <ExternalLink className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canEditOpportunity(opp)}
                  onClick={() => openEditForm(opp.id)}
                >
                  <Pencil /> {s.edit}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
