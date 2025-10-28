import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import type { LeaveType, LeaveRequest } from '../types';
import PrimaryButton from '../components/UI/PrimaryButton';
import InputField from '../components/UI/InputField';
import StatusBadge from '../components/UI/StatusBadge';
import DataTable from '../components/UI/DataTable';
import { showSuccess, showError } from '../utils/toast';

const LeavePage: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [types, requests] = await Promise.all([
        leaveService.getLeaveTypes(),
        leaveService.getMyRequests(),
      ]);
      setLeaveTypes(types);
      setMyRequests(requests);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await leaveService.createRequest({
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: diffDays,
        reason: formData.reason,
      });

      setFormData({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      });
      setShowForm(false);
      fetchData();
      showSuccess('Leave request submitted successfully');
    } catch (error) {
      console.error('Error creating leave request:', error);
      showError('Failed to create leave request');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'leave_type_id' as keyof LeaveRequest,
      header: 'Leave Type',
      render: (_value: any, row: LeaveRequest) => row.leave_type?.name || 'N/A',
    },
    {
      key: 'start_date' as keyof LeaveRequest,
      header: 'Start Date',
      render: (_value: any, row: LeaveRequest) => new Date(row.start_date).toLocaleDateString(),
    },
    {
      key: 'end_date' as keyof LeaveRequest,
      header: 'End Date',
      render: (_value: any, row: LeaveRequest) => new Date(row.end_date).toLocaleDateString(),
    },
    {
      key: 'total_days' as keyof LeaveRequest,
      header: 'Total Days',
    },
    {
      key: 'status' as keyof LeaveRequest,
      header: 'Status',
      render: (_value: any, row: LeaveRequest) => <StatusBadge status={row.status} />,
    },
    {
      key: 'reason' as keyof LeaveRequest,
      header: 'Reason',
      render: (_value: any, row: LeaveRequest) => (
        <span className="text-slate-500 text-sm">{row.reason || 'N/A'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">My Leave Requests</h1>
          <p className="text-slate-500 mt-1">Request and manage your leave applications</p>
        </div>
        <PrimaryButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Request'}
          </PrimaryButton>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Submit Leave Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    value={formData.leave_type_id}
                    onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <InputField
                    label="Start Date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />

                  <InputField
                    label="End Date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                    placeholder="Enter reason for leave request..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <DataTable columns={columns} data={myRequests} keyField="id" />
      </div>
    </div>
  );
};

export default LeavePage;
