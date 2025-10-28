import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import type { LeaveRequest } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import PrimaryButton from '../components/UI/PrimaryButton';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const TeamLeavePage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeamRequests();
  }, []);

  const loadTeamRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getTeamRequests();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Failed to load team leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setComment('');
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedRequest(null);
    setComment('');
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      if (actionType === 'approve') {
        await leaveService.approveRequest(selectedRequest.id, comment);
      } else {
        await leaveService.rejectRequest(selectedRequest.id, comment);
      }
      await loadTeamRequests();
      closeActionModal();
    } catch (error) {
      console.error(`Failed to ${actionType} leave request:`, error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading team leave requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Team Leave Requests</h1>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No pending leave requests from your team.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-white">{request.employee.first_name} {request.employee.last_name}</div>
                        <div className="text-gray-400">{request.employee.employee_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {request.leave_type.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(request.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(request.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {request.total_days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.status === 'PENDING' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openActionModal(request, 'approve')}
                            className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(request, 'reject')}
                            className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-gray-400">Employee: </span>
                <span className="text-white">{selectedRequest.employee.first_name} {selectedRequest.employee.last_name}</span>
              </div>
              <div>
                <span className="text-gray-400">Leave Type: </span>
                <span className="text-white">{selectedRequest.leave_type.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Duration: </span>
                <span className="text-white">
                  {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()} 
                  ({selectedRequest.total_days} days)
                </span>
              </div>
              <div>
                <span className="text-gray-400">Reason: </span>
                <span className="text-white">{selectedRequest.reason}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Add a comment..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeActionModal}
                disabled={submitting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <PrimaryButton
                onClick={handleAction}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeavePage;
