import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface AdminTableSkeletonProps {
    columnCount?: number
    rowCount?: number
    showAvatar?: boolean
    showActions?: boolean
}

export function AdminTableSkeleton({
    columnCount = 5,
    rowCount = 10,
    showAvatar = true,
    showActions = true,
}: AdminTableSkeletonProps) {
    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columnCount }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rowCount }).map((_, i) => (
                        <TableRow key={i}>
                            {Array.from({ length: columnCount }).map((_, j) => (
                                <TableCell key={j}>
                                    {j === 0 && showAvatar ? (
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-2 w-32" />
                                            </div>
                                        </div>
                                    ) : j === columnCount - 1 && showActions ? (
                                        <div className="flex justify-end">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    ) : (
                                        <Skeleton className="h-4 w-full" />
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
