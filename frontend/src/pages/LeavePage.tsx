import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leaveService } from '../services/leaveService';
import type { LeaveType, LeaveRequest } from '../types';
import PrimaryButton from '../components/UI/PrimaryButton';
import InputField from '../components/UI/InputField';
import StatusBadge from '../components/UI/StatusBadge';
import DataTable from '../components/UI/DataTable';

const LeavePage: React.FC = () => {
  const { user } = useAuth();
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
    } catch (error) {
      console.error('Error creating leave request:', error);
      alert('Failed to create leave request');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Leave Type',
      accessor: (row: LeaveRequest) => row.leave_type?.name || 'N/A',
    },
    {
      header: 'Start Date',
      accessor: (row: LeaveRequest) => new Date(row.start_date).toLocaleDateString(),
    },
    {
      header: 'End Date',
      accessor: (row: LeaveRequest) => new Date(row.end_date).toLocaleDateString(),
    },
    {
      header: 'Total Days',
      accessor: (row: LeaveRequest) => row.total_days,
    },
    {
      header: 'Status',
      accessor: (row: LeaveRequest) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Reason',
      accessor: (row: LeaveRequest) => (
        <span className="text-gray-400 text-sm">{row.reason || 'N/A'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Leave Requests</h1>
        <PrimaryButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Request'}
          </PrimaryButton>
        </div>

        {showForm && (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Submit Leave Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Leave Type
                  </label>
                  <select
                    value={formData.leave_type_id}
                    onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    rows={3}
                    placeholder="Enter reason for leave request..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
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

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <DataTable columns={columns} data={myRequests} keyField="id" />
      </div>
    </div>
  );
};

export default LeavePage;
