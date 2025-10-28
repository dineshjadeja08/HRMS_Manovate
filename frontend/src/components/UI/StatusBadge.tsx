import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string): string => {
    const normalizedStatus = status.toUpperCase();
    
    switch (normalizedStatus) {
      case 'PENDING':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'APPROVED':
      case 'ACTIVE':
      case 'COMPLETED':
      case 'PROCESSED':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'REJECTED':
      case 'TERMINATED':
      case 'CANCELLED':
        return 'bg-red-900 text-red-200 border-red-700';
      case 'ON_LEAVE':
        return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'DRAFT':
        return 'bg-gray-700 text-gray-200 border-gray-600';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
