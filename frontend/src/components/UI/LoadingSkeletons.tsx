/**
 * Loading Skeleton Components
 * Provides better perceived performance during data loading
 */
import React from 'react';

// Base skeleton animation
const SkeletonBase: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
);

// Table Skeleton - for data tables
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => (
  <div className="bg-white rounded-xl shadow-card overflow-hidden">
    {/* Table Header */}
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBase key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Card Skeleton - for dashboard cards and info cards
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-6 shadow-card">
        <SkeletonBase className="h-4 w-24 mb-4" />
        <SkeletonBase className="h-8 w-32 mb-2" />
        <SkeletonBase className="h-3 w-20" />
      </div>
    ))}
  </div>
);

// Chart Skeleton - for data visualizations
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-card p-6">
    {/* Chart Title */}
    <div className="mb-6">
      <SkeletonBase className="h-6 w-48 mb-2" />
      <SkeletonBase className="h-4 w-64" />
    </div>

    {/* Chart Area */}
    <div className="flex items-end justify-between h-64 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <SkeletonBase
            className="w-full"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        </div>
      ))}
    </div>

    {/* Chart Legend */}
    <div className="flex gap-6 justify-center mt-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <SkeletonBase className="h-3 w-3 rounded-full" />
          <SkeletonBase className="h-3 w-20" />
        </div>
      ))}
    </div>
  </div>
);

// Form Skeleton - for forms
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="bg-white rounded-xl shadow-card p-6 space-y-4">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index}>
        <SkeletonBase className="h-4 w-32 mb-2" />
        <SkeletonBase className="h-10 w-full" />
      </div>
    ))}
    <div className="flex justify-end gap-3 mt-6">
      <SkeletonBase className="h-10 w-24" />
      <SkeletonBase className="h-10 w-32" />
    </div>
  </div>
);

// List Skeleton - for simple lists
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="bg-white rounded-xl shadow-card overflow-hidden">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-4">
          <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
          <SkeletonBase className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Page Skeleton - full page loading
export const PageSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <SkeletonBase className="h-8 w-64 mb-2" />
      <SkeletonBase className="h-4 w-96" />
    </div>

    {/* Stats Cards */}
    <CardSkeleton count={4} />

    {/* Main Content */}
    <TableSkeleton rows={8} columns={5} />
  </div>
);

// Export all skeletons
export default {
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  ListSkeleton,
  PageSkeleton,
};
