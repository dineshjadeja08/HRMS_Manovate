import api from './api';

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  status: string;
  geo_location: {
    lat: number;
    long: number;
  } | null;
  notes: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
}

export interface AttendanceAdjustment {
  clock_in?: string;
  clock_out?: string;
  reason: string;
}

export const attendanceManagementService = {
  // Get attendance records for review (manager/HR)
  getRecordsForReview: async (
    start_date?: string,
    end_date?: string,
    department?: string
  ): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (department) params.append('department', department);

    const response = await api.get(`/attendance/records/review?${params.toString()}`);
    return response.data;
  },

  // Adjust attendance record
  adjustAttendance: async (
    recordId: number,
    adjustment: AttendanceAdjustment
  ): Promise<AttendanceRecord> => {
    const response = await api.post(`/attendance/records/${recordId}/adjustment`, adjustment);
    return response.data;
  },

  // Review/approve attendance record
  reviewAttendance: async (
    recordId: number,
    status: 'APPROVED' | 'REJECTED',
    notes?: string
  ): Promise<AttendanceRecord> => {
    const response = await api.put(`/attendance/records/${recordId}/review`, {
      status,
      notes,
    });
    return response.data;
  },

  // Get team attendance records
  getTeamAttendance: async (
    start_date?: string,
    end_date?: string
  ): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);

    const response = await api.get(`/attendance/records/review?${params.toString()}`);
    return response.data;
  },
};
