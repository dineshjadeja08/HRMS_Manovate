import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import { payrollService } from '../services/payrollService';
import type { Employee, LeaveBalance, Payslip } from '../types';
import PrimaryButton from '../components/UI/PrimaryButton';
import StatusBadge from '../components/UI/StatusBadge';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!user?.employee_id) return;

    try {
      const [empData, balances, slips] = await Promise.all([
        employeeService.getById(user.employee_id),
        leaveService.getBalances(user.employee_id),
        payrollService.getPayslips(user.employee_id),
      ]);

      setEmployee(empData);
      setLeaveBalances(balances);
      setPayslips(slips.slice(0, 3)); // Last 3 payslips
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await attendanceService.clockIn({
            geo_location: {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            },
          });
          setClockedIn(true);
        });
      } else {
        await attendanceService.clockIn({});
        setClockedIn(true);
      }
    } catch (error) {
      console.error('Error clocking in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await attendanceService.clockOut();
      setClockedIn(false);
    } catch (error) {
      console.error('Error clocking out:', error);
    }
  };

  const downloadPayslip = async (payslipId: number) => {
    if (!user?.employee_id) return;
    try {
      const blob = await payrollService.downloadPayslip(user.employee_id, payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading payslip:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const annualLeave = leaveBalances.find(b => b.leave_type?.name.toLowerCase().includes('annual'));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Profile Card */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Name</p>
            <p className="text-white font-medium">{employee?.first_name} {employee?.last_name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Employee Number</p>
            <p className="text-white font-medium">{employee?.employee_number}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Position</p>
            <p className="text-white font-medium">{employee?.position?.title || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Department</p>
            <p className="text-white font-medium">{employee?.department?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <StatusBadge status={employee?.employment_status || 'ACTIVE'} />
          </div>
        </div>
      </div>

      {/* Attendance Widget */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Attendance</h2>
        <div className="flex gap-4">
          {!clockedIn ? (
            <PrimaryButton onClick={handleClockIn} className="flex-1">
              🕐 Clock In
            </PrimaryButton>
          ) : (
            <div className="flex-1 space-y-2">
              <div className="text-green-400 font-medium">✓ Clocked In</div>
              <PrimaryButton onClick={handleClockOut} className="w-full bg-orange-600 hover:bg-orange-700">
                🕐 Clock Out
              </PrimaryButton>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-3">
          📍 Location tracking enabled for accurate attendance
        </p>
      </div>

      {/* Leave Balance */}
      {annualLeave && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Leave Balance</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Annual Leave</span>
                <span className="text-white font-medium">
                  {annualLeave.available_days} / {annualLeave.total_days} Days
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-cyan-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${(annualLeave.available_days / annualLeave.total_days) * 100}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="text-white font-medium">{annualLeave.total_days}</p>
            </div>
            <div>
              <p className="text-gray-400">Used</p>
              <p className="text-white font-medium">{annualLeave.used_days}</p>
            </div>
            <div>
              <p className="text-gray-400">Available</p>
              <p className="text-cyan-500 font-medium">{annualLeave.available_days}</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Payslip Widget */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Payslips</h2>
        {payslips.length > 0 ? (
          <div className="space-y-3">
            {payslips.map((payslip) => (
              <div
                key={payslip.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {new Date(payslip.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Net: {payslip.currency} {payslip.net_salary.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => downloadPayslip(payslip.id)}
                  className="px-4 py-2 text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
                >
                  📥 Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No payslips available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
