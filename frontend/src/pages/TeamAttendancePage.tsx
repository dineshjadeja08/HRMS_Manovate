import React, { useState, useEffect } from 'react';
import { attendanceManagementService, type AttendanceRecord, type AttendanceAdjustment } from '../services/attendanceManagementService';
import PrimaryButton from '../components/UI/PrimaryButton';
import StatusBadge from '../components/UI/StatusBadge';
import { ClockIcon, CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

const TeamAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [adjustmentData, setAdjustmentData] = useState<AttendanceAdjustment>({
    reason: '',
  });
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadRecords();
  }, [dateRange]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await attendanceManagementService.getRecordsForReview(
        dateRange.start,
        dateRange.end
      );
      setRecords(data);
    } catch (error) {
      console.error('Failed to load attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setAdjustmentData({
      clock_in: record.clock_in,
      clock_out: record.clock_out || '',
      reason: '',
    });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async () => {
    if (!selectedRecord || !adjustmentData.reason) {
      alert('Please provide a reason for adjustment');
      return;
    }

    try {
      await attendanceManagementService.adjustAttendance(selectedRecord.id, adjustmentData);
      setShowAdjustModal(false);
      loadRecords();
      alert('Attendance adjusted successfully');
    } catch (error) {
      console.error('Failed to adjust attendance:', error);
      alert('Failed to adjust attendance');
    }
  };

  const handleReviewClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRecord) return;

    try {
      await attendanceManagementService.reviewAttendance(
        selectedRecord.id,
        status,
        reviewNotes
      );
      setShowReviewModal(false);
      loadRecords();
      alert(`Attendance ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to review attendance:', error);
      alert('Failed to review attendance');
    }
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Team Attendance Management</h1>
        <p className="text-slate-500 mt-1">Review and manage team attendance records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">Date Range:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Total Records</p>
              <p className="text-blue-900 text-3xl font-bold mt-2">{records.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Approved</p>
              <p className="text-green-900 text-3xl font-bold mt-2">
                {records.filter((r) => r.status === 'APPROVED').length}
              </p>
            </div>
            <CheckIcon className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-sm font-medium">Pending Review</p>
              <p className="text-yellow-900 text-3xl font-bold mt-2">
                {records.filter((r) => r.status === 'PRESENT' && !r.reviewed_by).length}
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Flagged</p>
              <p className="text-red-900 text-3xl font-bold mt-2">
                {records.filter((r) => r.status === 'REJECTED' || r.notes).length}
              </p>
            </div>
            <XMarkIcon className="h-12 w-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Attendance Records</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No attendance records found for the selected period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {record.employee_name || `Employee #${record.employee_id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatTime(record.clock_in)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {record.clock_out ? formatTime(record.clock_out) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {record.hours_worked?.toFixed(2) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.status} />
                      {record.reviewed_by && (
                        <div className="text-xs text-slate-400 mt-1">Reviewed</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleAdjustClick(record)}
                        className="text-primary-600 hover:text-primary-800"
                        title="Adjust Time"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      {!record.reviewed_by && (
                        <>
                          <button
                            onClick={() => handleReviewClick(record)}
                            className="text-green-600 hover:text-green-800"
                            title="Review"
                          >
                            <CheckIcon className="h-5 w-5 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Adjust Attendance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Clock In Time
                </label>
                <input
                  type="datetime-local"
                  value={adjustmentData.clock_in || ''}
                  onChange={(e) =>
                    setAdjustmentData({ ...adjustmentData, clock_in: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Clock Out Time
                </label>
                <input
                  type="datetime-local"
                  value={adjustmentData.clock_out || ''}
                  onChange={(e) =>
                    setAdjustmentData({ ...adjustmentData, clock_out: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Adjustment *
                </label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) =>
                    setAdjustmentData({ ...adjustmentData, reason: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Explain why this adjustment is needed"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <PrimaryButton onClick={handleAdjustSubmit}>
                  Save Adjustment
                </PrimaryButton>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-gray-100 text-slate-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Review Attendance</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">Employee:</p>
                <p className="font-medium text-slate-900">
                  {selectedRecord.employee_name || `Employee #${selectedRecord.employee_id}`}
                </p>
                <p className="text-sm text-slate-600 mt-2">Date:</p>
                <p className="font-medium text-slate-900">{formatDate(selectedRecord.date)}</p>
                <p className="text-sm text-slate-600 mt-2">Time:</p>
                <p className="font-medium text-slate-900">
                  {formatTime(selectedRecord.clock_in)} -{' '}
                  {selectedRecord.clock_out ? formatTime(selectedRecord.clock_out) : 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add any notes about this attendance record"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleReviewSubmit('APPROVED')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  <CheckIcon className="h-5 w-5 inline mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleReviewSubmit('REJECTED')}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <XMarkIcon className="h-5 w-5 inline mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-slate-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAttendancePage;
