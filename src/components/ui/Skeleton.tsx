import React from 'react';

/**
 * Universal Skeleton Loader for smooth UI loading states
 * Prevents abrupt layout shifts and provides instant perceived feedback
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-stone-200/80 ${className}`}
      {...props}
    />
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#E8E2D9] shadow-sm p-3 space-y-3">
      <Skeleton className="w-full aspect-[4/3] rounded-xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#E8E2D9] shadow-sm p-4 space-y-3">
      <Skeleton className="w-full aspect-[16/10] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4 rounded" />
        <Skeleton className="h-5 w-4/5 rounded" />
        <Skeleton className="h-3 w-full rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse border-b border-stone-100">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="py-4 px-6">
          <Skeleton className="h-4 w-full max-w-[120px] rounded" />
        </td>
      ))}
    </tr>
  );
}

export default Skeleton;

