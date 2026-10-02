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

export function BulkResultDialog() {
  const { bulkResult, dismissBulkResult, language } = useOpportunitiesStore()
  const s = t(language)

  return (
    <Dialog open={!!bulkResult} onOpenChange={(open) => !open && dismissBulkResult()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{s.reviewFailedRecords}</DialogTitle>
          <DialogDescription>
            {bulkResult && s.bulkPartial(bulkResult.updated, bulkResult.failed.length)}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border">
          {bulkResult?.failed.map((f) => (
            <div key={f.id} className="border-b border-border px-3 py-2 text-xs last:border-b-0">
              <div className="font-medium text-foreground">{f.name}</div>
              <div className="text-muted-foreground">{f.reason}</div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={dismissBulkResult}>{s.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
