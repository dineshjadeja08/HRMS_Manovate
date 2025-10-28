import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import type { AttendanceRecord } from '../types';
import PrimaryButton from '../components/UI/PrimaryButton';
import StatusBadge from '../components/UI/StatusBadge';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadAttendanceRecords();
    // Update clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getMyRecords();
      setRecords(data);
      
      // Find today's record
      const today = new Date().toISOString().split('T')[0];
      const todayRec = data.find(r => r.date.startsWith(today));
      setTodayRecord(todayRec || null);
    } catch (error) {
      console.error('Failed to load attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      
      // Get geolocation if available
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.warn('Geolocation not available:', error);
        }
      }

      await attendanceService.clockIn(latitude, longitude);
      await loadAttendanceRecords();
    } catch (error: any) {
      console.error('Clock in failed:', error);
      alert(error.response?.data?.detail || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);

      await attendanceService.clockOut();
      await loadAttendanceRecords();
    } catch (error: any) {
      console.error('Clock out failed:', error);
      alert(error.response?.data?.detail || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateHoursWorked = (clockIn: string, clockOut?: string) => {
    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-600">Loading attendance...</div>
      </div>
    );
  }

  const isClockedIn = todayRecord && !todayRecord.clock_out;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Attendance</h1>
        <p className="text-slate-500 mt-1">Track your work hours and attendance</p>
      </div>

      {/* Current Time & Clock In/Out Card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Current Time Display */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <ClockIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Current Time</span>
            </div>
            <div className="text-4xl font-bold text-slate-800">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {formatDate(currentTime.toISOString())}
            </div>
          </div>

          {/* Today's Status */}
          <div className="flex-1 text-center">
            {todayRecord ? (
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Today's Status</div>
                <StatusBadge status={todayRecord.status} />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">Clock In</div>
                    <div className="text-lg font-bold text-green-700">
                      {todayRecord.clock_in ? formatTime(todayRecord.clock_in) : '--:--'}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium">Clock Out</div>
                    <div className="text-lg font-bold text-blue-700">
                      {todayRecord.clock_out ? formatTime(todayRecord.clock_out) : '--:--'}
                    </div>
                  </div>
                </div>
                {todayRecord.clock_in && (
                  <div className="text-sm text-slate-600 mt-2">
                    Hours: <span className="font-semibold">{calculateHoursWorked(todayRecord.clock_in, todayRecord.clock_out)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 py-4">
                No attendance record for today
              </div>
            )}
          </div>

          {/* Clock In/Out Buttons */}
          <div className="flex flex-col gap-3">
            {!isClockedIn ? (
              <PrimaryButton 
                onClick={handleClockIn} 
                disabled={actionLoading || !!todayRecord}
                className="w-48"
              >
                <ClockIcon className="h-5 w-5 mr-2 inline" />
                {actionLoading ? 'Clocking In...' : 'Clock In'}
              </PrimaryButton>
            ) : (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="w-48 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                {actionLoading ? 'Clocking Out...' : 'Clock Out'}
              </button>
            )}
            {todayRecord?.geo_location && (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                Location tracked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-slate-800">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Hours Worked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {record.clock_in ? formatTime(record.clock_in) : '--:--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {record.clock_out ? formatTime(record.clock_out) : '--:--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {record.clock_in 
                        ? `${calculateHoursWorked(record.clock_in, record.clock_out)} hrs`
                        : '--'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {record.geo_location ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span>Tracked</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not tracked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
