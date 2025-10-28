import api from './api';
import type { Employee, Department, Position } from '../types';

export const employeeService = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees/');
    return response.data;
  },

  // Get employee by ID
  getById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Get current user's employee data
  getMe: async (): Promise<Employee> => {
    const response = await api.get('/employees/me');
    return response.data;
  },

  // Create new employee
  create: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await api.post('/employees/', data);
    return response.data;
  },

  // Update employee
  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  // Delete employee
  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Get all departments
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/employees/departments/');
    return response.data;
  },

  // Get all positions
  getPositions: async (): Promise<Position[]> => {
    const response = await api.get('/employees/positions/');
    return response.data;
  },
};
