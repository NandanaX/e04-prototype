import { useState } from "react"
import { AlertTriangle } from "lucide-react"
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
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"

/** Shown for a drop that is blocked outright — no data is written back. */
export function DropRejectionDialog() {
  const { dropRejection, dismissRejection, language } = useOpportunitiesStore()
  const s = t(language)
  return (
    <Dialog open={!!dropRejection} onOpenChange={(open) => !open && dismissRejection()}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4.5" />
          </div>
          <DialogTitle>{s.dropRejectedTitle}</DialogTitle>
          <DialogDescription>{dropRejection?.reason}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={dismissRejection} className="w-full sm:w-auto">
            {s.dismiss}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Shown for a drop that requires one more piece of data before it is accepted. */
export function LostReasonDialog() {
  const { pendingLostConfirmation, cancelPendingMove, confirmLostMove, language } =
    useOpportunitiesStore()
  const s = t(language)
  const [reason, setReason] = useState("")

  return (
    <Dialog
      open={!!pendingLostConfirmation}
      onOpenChange={(open) => {
        if (!open) {
          cancelPendingMove()
          setReason("")
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{s.lostReasonTitle}</DialogTitle>
          <DialogDescription>{s.lostReasonDesc}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="lost-reason">{s.lostReasonTitle}</Label>
          <Input
            id="lost-reason"
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={s.lostReasonPlaceholder}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={cancelPendingMove}>
            {s.cancel}
          </Button>
          <Button
            variant="destructive-solid"
            disabled={reason.trim().length === 0}
            onClick={() => {
              confirmLostMove(reason.trim())
              setReason("")
            }}
          >
            {s.confirmLost}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
