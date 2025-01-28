import React from 'react';
import { Skeleton, SVGSkeleton } from './Skeleton';

export const PostSkeleton = () => (
  <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <SVGSkeleton className="w-10 h-10 rounded-full" />
        <div>
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <SVGSkeleton className="w-8 h-8 rounded-full" />
    </div>
    
    <div className="mt-4 space-y-2">
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>

    <div className="mt-4 flex items-center space-x-6">
      <div className="flex items-center space-x-2">
        <SVGSkeleton className="w-6 h-6" />
        <Skeleton className="w-4 h-4" />
      </div>
      <div className="flex items-center space-x-2">
        <SVGSkeleton className="w-6 h-6" />
        <Skeleton className="w-4 h-4" />
      </div>
      <div className="flex items-center space-x-2">
        <SVGSkeleton className="w-6 h-6" />
      </div>
    </div>

    <div className="mt-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Skeleton className="w-full h-10 rounded-lg" />
        </div>
        <SVGSkeleton className="w-10 h-10 rounded-lg" />
      </div>
    </div>
  </div>
);