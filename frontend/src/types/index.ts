// API Response Types matching backend schemas

export type RoleType = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'EXECUTIVE';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
export type PayrollStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: number;
  email: string;
  role: RoleType;
  is_active: boolean;
  employee_id?: number;
  created_at: string;
}

export interface Employee {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  hire_date: string;
  employment_status: EmploymentStatus;
  department_id?: number;
  position_id?: number;
  manager_id?: number;
  salary?: number;
  currency?: string;
  created_at: string;
  updated_at?: string;
}

export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  location?: string;
  head_id?: number;
  created_at: string;
}

export interface Position {
  id: number;
  title: string;
  code?: string;
  description?: string;
  level?: string;
  created_at: string;
}

export interface LeaveType {
  id: number;
  name: string;
  code?: string;
  description?: string;
  max_days_per_year: number;
  is_paid: boolean;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  total_days: number;
  used_days: number;
  available_days: number;
  updated_at?: string;
  leave_type?: LeaveType;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: LeaveRequestStatus;
  approved_by?: number;
  approval_comment?: string;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  leave_type?: LeaveType;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  shift_id?: number;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: AttendanceStatus;
  hours_worked: number;
  geo_location?: { lat: number; long: number };
  notes?: string;
  is_reviewed: boolean;
  reviewed_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface PayrollRun {
  id: number;
  period_start: string;
  period_end: string;
  status: PayrollStatus;
  total_amount: number;
  processed_by?: number;
  processed_at?: string;
  created_at: string;
}

export interface Payslip {
  id: number;
  employee_id: number;
  payroll_run_id: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  tax: number;
  net_salary: number;
  currency: string;
  file_path?: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LeaveRequestCreate {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
}

export interface LeaveRequestAction {
  action: 'Approve' | 'Reject';
  comment?: string;
}

export interface ClockInRequest {
  geo_location?: { lat: number; long: number };
}

export interface HeadcountReport {
  total_employees: number;
  by_department: Array<{
    department: string;
    count: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
  }>;
}
