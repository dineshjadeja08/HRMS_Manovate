import api from './api';

interface HeadcountReport {
  total_employees: number;
  active_employees: number;
  by_department: Array<{ department: string; count: number }>;
  by_position: Array<{ position: string; count: number }>;
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
};
