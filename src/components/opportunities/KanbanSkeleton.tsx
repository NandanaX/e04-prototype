import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

const COLUMNS = 5
const CARDS_PER_COLUMN = 3

export function KanbanSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4" aria-hidden="true">
      <div className="flex h-full gap-3">
        {Array.from({ length: COLUMNS }, (_, colIndex) => (
          <div key={colIndex} className="flex h-full w-72 shrink-0 flex-col rounded-lg bg-muted/40">
            <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <div className="flex-1 space-y-2 px-2 pb-2">
              {Array.from({ length: CARDS_PER_COLUMN }, (_, cardIndex) => (
                <Card key={cardIndex} className="gap-3 py-3">
                  <CardContent className="flex flex-col gap-2.5 px-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="size-5 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
