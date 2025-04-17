import { Skeleton } from '@/components/ui/skeleton';

export default function TableSkeleton() {
  return (
    <div className="w-full bg-white rounded-md">
      <div className="border-b py-3 w-full">
        <div className="grid grid-cols-5 w-full">
          {/* Skeleton for table headers */}
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-3/4 rounded-md" />
        </div>
      </div>
      <div className="grid grid-rows-5 w-full">
        {/* Skeleton for table rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 space-x-4 py-2">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
