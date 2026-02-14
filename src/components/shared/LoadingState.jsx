/**
 * LoadingState Component - Skeleton loaders and spinners
 */
import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-4 border-b border-gray-100 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="flex gap-1 mt-2">
            <div className="h-5 bg-gray-100 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded-lg" />
        <div className="h-32 bg-gray-100 rounded-lg" />
        <div className="h-24 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export function LoadingState({ message = 'Loading...', showSpinner = true }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
      {showSpinner && <Spinner size="lg" className="text-orange-500 mb-3" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default LoadingState;
