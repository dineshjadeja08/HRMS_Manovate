import api from './api';
import type { AttendanceRecord } from '../types';

export const attendanceService = {
  // Get attendance records for current user (using the current user's employee_id from context)
  getMyRecords: async (): Promise<AttendanceRecord[]> => {
    // First get current user to get employee_id
    const userResponse = await api.get('/auth/me');
    const employeeId = userResponse.data.employee_id;
    
    if (!employeeId) {
      throw new Error('User is not linked to an employee profile');
    }
    
    const response = await api.get(`/attendance/records/${employeeId}`);
    return response.data;
  },

  // Get all attendance records (admin)
  getAll: async (): Promise<AttendanceRecord[]> => {
    const response = await api.get('/attendance/');
    return response.data;
  },

  // Clock in
  clockIn: async (latitude?: number, longitude?: number): Promise<AttendanceRecord> => {
    // First get current user to get employee_id
    const userResponse = await api.get('/auth/me');
    const employeeId = userResponse.data.employee_id;
    
    if (!employeeId) {
      throw new Error('User is not linked to an employee profile');
    }

    const geo_location = (latitude !== undefined && longitude !== undefined)
      ? { lat: latitude, long: longitude }
      : undefined;

    const response = await api.post('/attendance/clock-in', {
      employee_id: employeeId,
      geo_location,
    });
    return response.data;
  },

  // Clock out
  clockOut: async (): Promise<AttendanceRecord> => {
    // First get current user to get employee_id
    const userResponse = await api.get('/auth/me');
    const employeeId = userResponse.data.employee_id;
    
    if (!employeeId) {
      throw new Error('User is not linked to an employee profile');
    }

    const response = await api.post('/attendance/clock-out', {
      employee_id: employeeId,
    });
    return response.data;
  },

  // Get attendance record by ID
  getById: async (id: number): Promise<AttendanceRecord> => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },
};
