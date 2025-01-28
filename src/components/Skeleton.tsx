import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div aria-live="polite" aria-busy="true" className={className}>
    <span className="inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 dark:bg-gray-700 leading-none">
      ‌
    </span>
    <br />
  </div>
);

export const SVGSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <svg
    className={
      className + " animate-pulse rounded bg-gray-300 dark:bg-gray-700"
    }
  />
);

export const FollowingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
        <SVGSkeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
    ))}
  </div>
);