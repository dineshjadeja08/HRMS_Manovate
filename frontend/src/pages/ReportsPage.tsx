import React, { useState, useEffect } from 'react';
import { reportsService } from '../services/reportsService';
import PrimaryButton from '../components/UI/PrimaryButton';
import { 
  UsersIcon, 
  DocumentArrowDownIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  UserMinusIcon
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

interface TurnoverData {
  period: string;
  total_employees: number;
  terminations: number;
  turnover_rate: number;
  by_department: Array<{ department: string; turnover_rate: number; terminations: number }>;
  voluntary_terminations: number;
  involuntary_terminations: number;
}

interface LeaveUtilizationData {
  period: string;
  total_leave_days: number;
  approved_leave_days: number;
  pending_leave_days: number;
  utilization_rate: number;
  by_leave_type: Array<{ leave_type: string; days_taken: number; percentage: number }>;
  by_department: Array<{ department: string; days_taken: number; utilization_rate: number }>;
}

interface AbsenteeismData {
  period: string;
  total_work_days: number;
  total_absences: number;
  absenteeism_rate: number;
  by_department: Array<{ department: string; absenteeism_rate: number; total_absences: number }>;
  by_employee: Array<{ employee_id: number; employee_name: string; absences: number; absenteeism_rate: number }>;
}

const COLORS = ['#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308', '#f59e0b', '#ef4444'];

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'headcount' | 'turnover' | 'leave' | 'absenteeism'>('headcount');
  const [headcount, setHeadcount] = useState<HeadcountData | null>(null);
  const [turnover, setTurnover] = useState<TurnoverData | null>(null);
  const [leaveUtilization, setLeaveUtilization] = useState<LeaveUtilizationData | null>(null);
  const [absenteeism, setAbsenteeism] = useState<AbsenteeismData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('excel');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadHeadcountReport();
  }, []);

  useEffect(() => {
    if (activeTab === 'turnover') {
      loadTurnoverReport();
    } else if (activeTab === 'leave') {
      loadLeaveUtilizationReport();
    } else if (activeTab === 'absenteeism') {
      loadAbsenteeismReport();
    }
  }, [activeTab, dateRange]);

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

  const loadTurnoverReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getTurnoverReport(dateRange.start, dateRange.end);
      setTurnover(data);
    } catch (error) {
      console.error('Failed to load turnover report:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveUtilizationReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getLeaveUtilizationReport(dateRange.start, dateRange.end);
      setLeaveUtilization(data);
    } catch (error) {
      console.error('Failed to load leave utilization report:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAbsenteeismReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getAbsenteeismReport(dateRange.start, dateRange.end);
      setAbsenteeism(data);
    } catch (error) {
      console.error('Failed to load absenteeism report:', error);
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
        <div className="text-slate-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">View and export comprehensive reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
            className="px-3 py-2 border border-gray-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="excel">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-card">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('headcount')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'headcount'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-5 w-5 inline mr-2" />
              Headcount
            </button>
            <button
              onClick={() => setActiveTab('turnover')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'turnover'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
              }`}
            >
              <ArrowTrendingUpIcon className="h-5 w-5 inline mr-2" />
              Turnover
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'leave'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
              }`}
            >
              <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
              Leave Utilization
            </button>
            <button
              onClick={() => setActiveTab('absenteeism')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'absenteeism'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
              }`}
            >
              <UserMinusIcon className="h-5 w-5 inline mr-2" />
              Absenteeism
            </button>
          </nav>
        </div>

        {/* Date Range Filter */}
        {activeTab !== 'headcount' && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
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
        )}

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'headcount' && renderHeadcountTab()}
          {activeTab === 'turnover' && renderTurnoverTab()}
          {activeTab === 'leave' && renderLeaveUtilizationTab()}
          {activeTab === 'absenteeism' && renderAbsenteeismTab()}
        </div>
      </div>

      {/* Export Options */}
      {renderExportSection()}
    </div>
  );

  function renderHeadcountTab() {
    return (
      <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Total Employees</p>
                <p className="text-blue-900 text-3xl font-bold mt-2">
                  {headcount?.total_employees || 0}
                </p>
              </div>
              <UsersIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Active Employees</p>
                <p className="text-green-900 text-3xl font-bold mt-2">
                  {headcount?.active_employees || 0}
                </p>
              </div>
              <UsersIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">Departments</p>
                <p className="text-orange-900 text-3xl font-bold mt-2">
                  {headcount?.by_department?.length || 0}
                </p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Headcount by Department</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  chartType === 'pie' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-white text-slate-700 hover:bg-gray-100'
                }`}
              >
                Pie Chart
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-white text-slate-700 hover:bg-gray-100'
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
                      {headcount.by_department.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={headcount.by_department}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#06b6d4" name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              No department data available
            </div>
          )}
        </div>
      </>
    );
  }

  function renderTurnoverTab() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
            <p className="text-red-700 text-sm font-medium">Turnover Rate</p>
            <p className="text-red-900 text-3xl font-bold mt-2">
              {turnover?.turnover_rate?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <p className="text-orange-700 text-sm font-medium">Total Terminations</p>
            <p className="text-orange-900 text-3xl font-bold mt-2">
              {turnover?.terminations || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
            <p className="text-yellow-700 text-sm font-medium">Voluntary</p>
            <p className="text-yellow-900 text-3xl font-bold mt-2">
              {turnover?.voluntary_terminations || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <p className="text-purple-700 text-sm font-medium">Involuntary</p>
            <p className="text-purple-900 text-3xl font-bold mt-2">
              {turnover?.involuntary_terminations || 0}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Turnover by Department</h3>
          {turnover?.by_department && turnover.by_department.length > 0 ? (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={turnover.by_department}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="department" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="turnover_rate" fill="#ef4444" name="Turnover Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              No turnover data available for selected period
            </div>
          )}
        </div>
      </>
    );
  }

  function renderLeaveUtilizationTab() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <p className="text-blue-700 text-sm font-medium">Utilization Rate</p>
            <p className="text-blue-900 text-3xl font-bold mt-2">
              {leaveUtilization?.utilization_rate?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <p className="text-green-700 text-sm font-medium">Approved Days</p>
            <p className="text-green-900 text-3xl font-bold mt-2">
              {leaveUtilization?.approved_leave_days || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
            <p className="text-yellow-700 text-sm font-medium">Pending Days</p>
            <p className="text-yellow-900 text-3xl font-bold mt-2">
              {leaveUtilization?.pending_leave_days || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <p className="text-purple-700 text-sm font-medium">Total Leave Days</p>
            <p className="text-purple-900 text-3xl font-bold mt-2">
              {leaveUtilization?.total_leave_days || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Leave by Type</h3>
            {leaveUtilization?.by_leave_type && leaveUtilization.by_leave_type.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={leaveUtilization.by_leave_type}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ leave_type, days_taken }) => `${leave_type}: ${days_taken}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="days_taken"
                    >
                      {leaveUtilization.by_leave_type.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">No data available</div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Leave by Department</h3>
            {leaveUtilization?.by_department && leaveUtilization.by_department.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={leaveUtilization.by_department}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="days_taken" fill="#10b981" name="Days Taken" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">No data available</div>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderAbsenteeismTab() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
            <p className="text-red-700 text-sm font-medium">Absenteeism Rate</p>
            <p className="text-red-900 text-3xl font-bold mt-2">
              {absenteeism?.absenteeism_rate?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <p className="text-orange-700 text-sm font-medium">Total Absences</p>
            <p className="text-orange-900 text-3xl font-bold mt-2">
              {absenteeism?.total_absences || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <p className="text-blue-700 text-sm font-medium">Total Work Days</p>
            <p className="text-blue-900 text-3xl font-bold mt-2">
              {absenteeism?.total_work_days || 0}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Absenteeism by Department</h3>
          {absenteeism?.by_department && absenteeism.by_department.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={absenteeism.by_department}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="department" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="absenteeism_rate" fill="#ef4444" name="Absenteeism Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">No data available</div>
          )}
        </div>

        {/* Top Absentees Table */}
        {absenteeism?.by_employee && absenteeism.by_employee.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Top Absentees</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Absences
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {absenteeism.by_employee.slice(0, 10).map((emp) => (
                    <tr key={emp.employee_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {emp.employee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {emp.absences}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {emp.absenteeism_rate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  }

  function renderExportSection() {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Export Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Headcount Report</h3>
            <p className="text-slate-600 text-sm mb-4">
              Complete employee headcount with department and position breakdown
            </p>
            <PrimaryButton onClick={handleExportHeadcount}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Headcount
            </PrimaryButton>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Attendance Report</h3>
            <p className="text-slate-600 text-sm mb-4">
              Employee attendance records with clock-in/out times
            </p>
            <PrimaryButton onClick={handleExportAttendance}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Attendance
            </PrimaryButton>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Leave Report</h3>
            <p className="text-slate-600 text-sm mb-4">
              Leave requests, balances, and approval status
            </p>
            <PrimaryButton onClick={handleExportLeave}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Leave
            </PrimaryButton>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Payroll Report</h3>
            <p className="text-slate-600 text-sm mb-4">
              Payroll runs, payslips, and compensation details
            </p>
            <PrimaryButton onClick={handleExportPayroll}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Export Payroll
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }
};

export default ReportsPage;
