import api from './api';
import type {
  LoginCredentials,
  AuthTokens,
  Employee,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestCreate,
  LeaveRequestAction,
  AttendanceRecord,
  ClockInRequest,
  PayrollRun,
  Payslip,
  Department,
  Position,
  HeadcountReport,
} from '../types';

// Auth Services
export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthTokens>('/auth/login', credentials),
  
  refresh: (refreshToken: string) =>
    api.post<{ access: string }>('/auth/refresh', { refresh: refreshToken }),
  
  getCurrentUser: () =>
    api.get<Employee>('/auth/me'),
};

// Employee Services
export const employeeService = {
  getAll: (params?: { skip?: number; limit?: number; department_id?: number; status?: string }) =>
    api.get<Employee[]>('/employees', { params }),
  
  getById: (id: number) =>
    api.get<Employee>(`/employees/${id}`),
  
  create: (data: Partial<Employee>) =>
    api.post<Employee>('/employees', data),
  
  update: (id: number, data: Partial<Employee>) =>
    api.put<Employee>(`/employees/${id}`, data),
};

// Department & Position Services
export const departmentService = {
  getAll: () => api.get<Department[]>('/departments'),
  getById: (id: number) => api.get<Department>(`/departments/${id}`),
};

export const positionService = {
  getAll: () => api.get<Position[]>('/positions'),
  getById: (id: number) => api.get<Position>(`/positions/${id}`),
};

// Leave Services
export const leaveService = {
  getTypes: () =>
    api.get<LeaveType[]>('/leave/types'),
  
  getBalances: (employeeId: number) =>
    api.get<LeaveBalance[]>(`/leave/balances/${employeeId}`),
  
  getRequests: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get<LeaveRequest[]>('/leave/requests', { params }),
  
  getTeamRequests: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get<LeaveRequest[]>('/leave/requests/team', { params }),
  
  createRequest: (data: LeaveRequestCreate) =>
    api.post<LeaveRequest>('/leave/requests', data),
  
  actionRequest: (requestId: number, data: LeaveRequestAction) =>
    api.put<LeaveRequest>(`/leave/requests/${requestId}/action`, data),
};

// Attendance Services
export const attendanceService = {
  getRecords: (employeeId: number, params?: { skip?: number; limit?: number }) =>
    api.get<AttendanceRecord[]>(`/attendance/records/${employeeId}`, { params }),
  
  clockIn: (data: ClockInRequest) =>
    api.post<AttendanceRecord>('/attendance/clock-in', data),
  
  clockOut: () =>
    api.post<AttendanceRecord>('/attendance/clock-out'),
};

// Payroll Services
export const payrollService = {
  getRuns: (params?: { skip?: number; limit?: number }) =>
    api.get<PayrollRun[]>('/payroll/runs', { params }),
  
  createRun: (data: { period_start: string; period_end: string }) =>
    api.post<PayrollRun>('/payroll/runs', data),
  
  getPayslips: (employeeId: number, params?: { skip?: number; limit?: number }) =>
    api.get<Payslip[]>(`/payroll/payslips/${employeeId}`, { params }),
  
  downloadPayslip: (employeeId: number, payslipId: number) =>
    api.get(`/payroll/payslips/${employeeId}/${payslipId}`, { responseType: 'blob' }),
  
  updateCompensation: (employeeId: number, data: { new_salary: number; change_reason: string; effective_date: string }) =>
    api.put(`/payroll/compensation/${employeeId}`, data),
};

// Reports Services
export const reportsService = {
  getHeadcount: () =>
    api.get<HeadcountReport>('/reports/headcount'),
  
  getTurnover: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/reports/turnover', { params }),
  
  getLeaveUtilization: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/reports/leave-utilization', { params }),
  
  getAbsenteeism: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/reports/absenteeism', { params }),
  
  exportEmployees: (format: 'csv' | 'excel' = 'csv') =>
    api.get(`/reports/export/employees?format=${format}`, { responseType: 'blob' }),
};
