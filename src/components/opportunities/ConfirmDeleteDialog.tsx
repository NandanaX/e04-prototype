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
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"

export function ConfirmDeleteDialog() {
  const { deleteConfirm, cancelDelete, confirmDelete, language } = useOpportunitiesStore()
  const s = t(language)

  return (
    <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && cancelDelete()}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4.5" />
          </div>
          <DialogTitle>{s.confirmDeleteTitle}</DialogTitle>
          <DialogDescription>
            {deleteConfirm && deleteConfirm.ids.length > 1
              ? s.confirmDeleteManyDesc(deleteConfirm.ids.length)
              : s.confirmDeleteOneDesc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={cancelDelete}>
            {s.cancel}
          </Button>
          <Button variant="destructive-solid" onClick={confirmDelete}>
            {s.deleteAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
