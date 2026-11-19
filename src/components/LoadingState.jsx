import React from 'react';

export default function LoadingState({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="h-48 bg-surface w-full"></div>
          
          <div className="p-4 space-y-4">
            {/* Title & Score skeleton */}
            <div className="flex justify-between items-start gap-4">
              <div className="h-6 bg-surface rounded w-3/4"></div>
              <div className="w-8 h-8 rounded-full bg-surface flex-shrink-0"></div>
            </div>
            
            {/* Price skeleton */}
            <div className="h-8 bg-surface rounded w-1/3"></div>
            
            {/* Details skeleton */}
            <div className="flex gap-4">
              <div className="h-4 bg-surface rounded w-16"></div>
              <div className="h-4 bg-surface rounded w-20"></div>
              <div className="h-4 bg-surface rounded w-24"></div>
            </div>
            
            {/* Tags skeleton */}
            <div className="pt-3 border-t border-border mt-3 space-y-2">
              <div className="h-5 bg-surface rounded w-32"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-surface rounded w-24"></div>
                <div className="h-5 bg-surface rounded w-28"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
