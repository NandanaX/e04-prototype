import { CheckCircle2, XCircle, Info, X } from "lucide-react"
import { useOpportunitiesStore } from "@/store/opportunities-store"
import { cn } from "@/lib/utils"

const TONE_ICON = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const

const TONE_CLASS = {
  success: "text-success",
  error: "text-destructive",
  info: "text-info",
} as const

export function ToastViewport() {
  const { toasts, dismissToast } = useOpportunitiesStore()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-6 end-6 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = TONE_ICON[toast.tone]
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs text-foreground shadow-floating"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", TONE_CLASS[toast.tone])} />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded text-muted-foreground transition-colors hover:text-foreground active:text-foreground/70"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
