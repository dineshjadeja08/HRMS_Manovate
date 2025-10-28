import api from './api';
import type { AttendanceRecord } from '../types';

export const attendanceService = {
  // Get attendance records for current user
  getMyRecords: async (): Promise<AttendanceRecord[]> => {
    const response = await api.get('/attendance/my-records');
    return response.data;
  },

  // Get all attendance records (admin)
  getAll: async (): Promise<AttendanceRecord[]> => {
    const response = await api.get('/attendance/');
    return response.data;
  },

  // Clock in
  clockIn: async (latitude?: number, longitude?: number): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/clock-in', {
      latitude,
      longitude,
    });
    return response.data;
  },

  // Clock out
  clockOut: async (latitude?: number, longitude?: number): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/clock-out', {
      latitude,
      longitude,
    });
    return response.data;
  },

  // Get attendance record by ID
  getById: async (id: number): Promise<AttendanceRecord> => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },
};
