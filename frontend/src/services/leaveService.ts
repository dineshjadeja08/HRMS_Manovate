import api from './api';
import type { LeaveRequest, LeaveBalance, LeaveType } from '../types';

export const leaveService = {
  // Get all leave requests (admin/manager)
  getAll: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/leave/requests/');
    return response.data;
  },

  // Get current user's leave requests
  getMyRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/leave/my-requests');
    return response.data;
  },

  // Get team leave requests (manager)
  getTeamRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/leave/team-requests');
    return response.data;
  },

  // Get leave request by ID
  getById: async (id: number): Promise<LeaveRequest> => {
    const response = await api.get(`/leave/requests/${id}`);
    return response.data;
  },

  // Create leave request
  createRequest: async (data: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    const response = await api.post('/leave/requests/', data);
    return response.data;
  },

  // Approve leave request
  approveRequest: async (id: number, comment?: string): Promise<LeaveRequest> => {
    const response = await api.post(`/leave/requests/${id}/approve`, { comment });
    return response.data;
  },

  // Reject leave request
  rejectRequest: async (id: number, comment?: string): Promise<LeaveRequest> => {
    const response = await api.post(`/leave/requests/${id}/reject`, { comment });
    return response.data;
  },

  // Get leave balances
  getBalances: async (employeeId?: number): Promise<LeaveBalance[]> => {
    const url = employeeId ? `/leave/balances/${employeeId}` : '/leave/my-balances';
    const response = await api.get(url);
    return response.data;
  },

  // Get all leave types
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await api.get('/leave/types/');
    return response.data;
  },
};
