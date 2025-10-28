import api from './api';

interface HeadcountReport {
  total_employees: number;
  active_employees: number;
  by_department: Array<{ department: string; count: number }>;
  by_position: Array<{ position: string; count: number }>;
}

interface TurnoverReport {
  period: string;
  total_employees: number;
  terminations: number;
  turnover_rate: number;
  by_department: Array<{ department: string; turnover_rate: number; terminations: number }>;
  voluntary_terminations: number;
  involuntary_terminations: number;
}

interface LeaveUtilizationReport {
  period: string;
  total_leave_days: number;
  approved_leave_days: number;
  pending_leave_days: number;
  utilization_rate: number;
  by_leave_type: Array<{ leave_type: string; days_taken: number; percentage: number }>;
  by_department: Array<{ department: string; days_taken: number; utilization_rate: number }>;
}

interface AbsenteeismReport {
  period: string;
  total_work_days: number;
  total_absences: number;
  absenteeism_rate: number;
  by_department: Array<{ department: string; absenteeism_rate: number; total_absences: number }>;
  by_employee: Array<{ employee_id: number; employee_name: string; absences: number; absenteeism_rate: number }>;
}

export const reportsService = {
  // Get headcount report
  getHeadcount: async (): Promise<HeadcountReport> => {
    const response = await api.get('/reports/headcount');
    return response.data;
  },

  // Export headcount report
  exportHeadcount: async (format: 'csv' | 'excel' = 'excel'): Promise<Blob> => {
    const response = await api.get(`/reports/headcount/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export attendance report
  exportAttendance: async (format: 'csv' | 'excel' = 'excel'): Promise<Blob> => {
    const response = await api.get(`/reports/attendance/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export leave report
  exportLeave: async (format: 'csv' | 'excel' = 'excel'): Promise<Blob> => {
    const response = await api.get(`/reports/leave/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export payroll report
  exportPayroll: async (format: 'csv' | 'excel' = 'excel'): Promise<Blob> => {
    const response = await api.get(`/reports/payroll/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get turnover report
  getTurnoverReport: async (start_date?: string, end_date?: string): Promise<TurnoverReport> => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    const response = await api.get(`/reports/turnover?${params.toString()}`);
    return response.data;
  },

  // Get leave utilization report
  getLeaveUtilizationReport: async (start_date?: string, end_date?: string): Promise<LeaveUtilizationReport> => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    const response = await api.get(`/reports/leave-utilization?${params.toString()}`);
    return response.data;
  },

  // Get absenteeism report
  getAbsenteeismReport: async (start_date?: string, end_date?: string): Promise<AbsenteeismReport> => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    const response = await api.get(`/reports/absenteeism?${params.toString()}`);
    return response.data;
  },
};
