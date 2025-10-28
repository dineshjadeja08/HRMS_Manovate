import React, { useState, useEffect } from 'react';
import { reportsService } from '../services/reportsService';
import PrimaryButton from '../components/UI/PrimaryButton';
import { 
  UsersIcon, 
  DocumentArrowDownIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface HeadcountData {
  total_employees: number;
  active_employees: number;
  by_department: Array<{ department: string; count: number }>;
  by_position: Array<{ position: string; count: number }>;
}

const COLORS = ['#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308', '#f59e0b', '#ef4444'];

const ReportsPage: React.FC = () => {
  const [headcount, setHeadcount] = useState<HeadcountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('excel');

  useEffect(() => {
    loadHeadcountReport();
  }, []);

  const loadHeadcountReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getHeadcount();
      setHeadcount(data);
    } catch (error) {
      console.error('Failed to load headcount report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportHeadcount = async () => {
    try {
      const blob = await reportsService.exportHeadcount(exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `headcount_report.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export headcount report:', error);
    }
  };

  const handleExportAttendance = async () => {
    try {
      const blob = await reportsService.exportAttendance(exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export attendance report:', error);
    }
  };

  const handleExportLeave = async () => {
    try {
      const blob = await reportsService.exportLeave(exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_report.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export leave report:', error);
    }
  };

  const handleExportPayroll = async () => {
    try {
      const blob = await reportsService.exportPayroll(exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_report.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export payroll report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        
        <div className="flex items-center space-x-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="excel">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Total Employees</p>
              <p className="text-white text-3xl font-bold mt-2">
                {headcount?.total_employees || 0}
              </p>
            </div>
            <div className="bg-cyan-500 bg-opacity-30 rounded-full p-3">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Employees</p>
              <p className="text-white text-3xl font-bold mt-2">
                {headcount?.active_employees || 0}
              </p>
            </div>
            <div className="bg-green-500 bg-opacity-30 rounded-full p-3">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Departments</p>
              <p className="text-white text-3xl font-bold mt-2">
                {headcount?.by_department?.length || 0}
              </p>
            </div>
            <div className="bg-yellow-500 bg-opacity-30 rounded-full p-3">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Headcount Chart */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Headcount by Department</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 rounded-md transition-colors ${
                chartType === 'pie' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-md transition-colors ${
                chartType === 'bar' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Bar Chart
            </button>
          </div>
        </div>

        {headcount?.by_department && headcount.by_department.length > 0 ? (
          <div style={{ width: '100%', height: 400 }}>
            {chartType === 'pie' ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={headcount.by_department}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ department, count }) => `${department}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {headcount.by_department.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer>
                <BarChart data={headcount.by_department}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="department" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Bar dataKey="count" fill="#06b6d4" name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            No department data available
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Export Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-700 rounded-lg p-4 hover:border-cyan-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Headcount Report</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Complete employee headcount with department and position breakdown
                </p>
              </div>
            </div>
            <PrimaryButton onClick={handleExportHeadcount}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Headcount
            </PrimaryButton>
          </div>

          <div className="border border-gray-700 rounded-lg p-4 hover:border-cyan-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Attendance Report</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Employee attendance records with clock-in/out times
                </p>
              </div>
            </div>
            <PrimaryButton onClick={handleExportAttendance}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Attendance
            </PrimaryButton>
          </div>

          <div className="border border-gray-700 rounded-lg p-4 hover:border-cyan-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Leave Report</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Leave requests, balances, and approval status
                </p>
              </div>
            </div>
            <PrimaryButton onClick={handleExportLeave}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Leave
            </PrimaryButton>
          </div>

          <div className="border border-gray-700 rounded-lg p-4 hover:border-cyan-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Payroll Report</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Payroll runs, payslips, and compensation details
                </p>
              </div>
            </div>
            <PrimaryButton onClick={handleExportPayroll}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Payroll
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
