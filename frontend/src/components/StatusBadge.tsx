import React from 'react';
import { clsx } from 'clsx';
import type { LeaveRequestStatus, PayrollStatus, EmploymentStatus, AttendanceStatus } from '../types';

type StatusType = LeaveRequestStatus | PayrollStatus | EmploymentStatus | AttendanceStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusColor = (status: StatusType): string => {
    const normalizedStatus = status.toUpperCase();
    
    switch (normalizedStatus) {
      case 'PENDING':
        return 'bg-status-pending/20 text-status-pending border-status-pending';
      case 'APPROVED':
      case 'ACTIVE':
      case 'PRESENT':
      case 'COMPLETED':
        return 'bg-status-approved/20 text-status-approved border-status-approved';
      case 'REJECTED':
      case 'TERMINATED':
      case 'ABSENT':
      case 'FAILED':
        return 'bg-status-rejected/20 text-status-rejected border-status-rejected';
      case 'CANCELLED':
      case 'INACTIVE':
      case 'PROCESSING':
        return 'bg-status-inactive/20 text-status-inactive border-status-inactive';
      case 'LATE':
      case 'HALF_DAY':
        return 'bg-accent/20 text-accent border-accent';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      {status}
    </span>
  );
};
