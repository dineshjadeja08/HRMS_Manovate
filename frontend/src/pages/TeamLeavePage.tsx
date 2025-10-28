import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import type { LeaveRequest } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import { CheckCircleIcon, XCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
        <div className="text-slate-600">Loading team leave requests...</div>
      </div>
    );
  }

  const pendingRequests = leaveRequests.filter(r => r.status === 'PENDING');
  const processedRequests = leaveRequests.filter(r => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Leave Management</h1>
          <p className="text-slate-500 mt-1">Review and approve team leave requests</p>
        </div>
      </div>

      {/* Pending Requests - Card Layout */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {request.employee?.first_name?.charAt(0)}{request.employee?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {request.employee?.first_name} {request.employee?.last_name}
                      </p>
                      <p className="text-sm text-slate-500">{request.leave_type?.name}</p>
                    </div>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Duration:</span> {request.total_days} days
                  </p>
                  {request.reason && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openActionModal(request, 'reject')}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openActionModal(request, 'approve')}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests Table */}
      {processedRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Processed Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {processedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {request.employee?.first_name} {request.employee?.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.leave_type?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.total_days}</td>
                    <td className="px-6 py-4"><StatusBadge status={request.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaveRequests.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-card">
          <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No leave requests found</p>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h3>
            
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-medium">Employee:</span> {selectedRequest.employee?.first_name} {selectedRequest.employee?.last_name}
              </p>
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-medium">Leave Type:</span> {selectedRequest.leave_type?.name}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Duration:</span> {selectedRequest.total_days} days
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Add a comment..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeActionModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeavePage;
