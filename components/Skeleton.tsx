import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  );
};

export const PackageSkeleton: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden p-6 space-y-4">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
};
