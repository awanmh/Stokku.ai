import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-secondary", className)}
      {...props}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="flex gap-4 px-4 py-3 border-b border-border bg-secondary">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`r-${rowIdx}`}
          className="flex items-center gap-4 px-4 border-b border-border"
          style={{ height: 48 }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`c-${rowIdx}-${colIdx}`}
              className="h-3 flex-1"
              style={{ maxWidth: colIdx === 0 ? 180 : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
}

function CardSkeleton({ count = 6 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-${i}`}
          className="rounded-lg border border-border bg-card p-6 space-y-3"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function WarehouseCardSkeleton({ count = 6 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`wh-${i}`}
          className="rounded-lg border border-border bg-card p-6 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-12 rounded" />
          </div>
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, TableSkeleton, CardSkeleton, WarehouseCardSkeleton };
