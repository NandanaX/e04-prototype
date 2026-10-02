import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SKELETON_ROWS = 8

export function ListSkeleton() {
  return (
    <div className="flex-1 overflow-hidden px-3 pt-2" aria-hidden="true">
      <Table>
        <TableHeader className="bg-surface-subtle">
          <TableRow>
            <TableHead className="w-6" />
            <TableHead className="w-10">
              <Skeleton className="size-4 rounded-xs" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-14" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-14" />
            </TableHead>
            <TableHead className="text-end">
              <Skeleton className="ms-auto h-3 w-12" />
            </TableHead>
            <TableHead className="text-end">
              <Skeleton className="ms-auto h-3 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-14" />
            </TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <TableRow key={i} className="hover:bg-card">
              <TableCell />
              <TableCell>
                <Skeleton className="size-4 rounded-xs" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-40" />
                <Skeleton className="mt-1.5 h-2.5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell className="text-end">
                <Skeleton className="ms-auto h-3 w-16" />
              </TableCell>
              <TableCell className="text-end">
                <Skeleton className="ms-auto h-3 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
