import api from './api';
import type { Payslip, PayrollRun } from '../types';

export const payrollService = {
  // Get all payslips (admin)
  getAllPayslips: async (): Promise<Payslip[]> => {
    const response = await api.get('/payroll/payslips/');
    return response.data;
  },

  // Get current user's payslips
  getPayslips: async (): Promise<Payslip[]> => {
    const response = await api.get('/payroll/my-payslips');
    return response.data;
  },

  // Get payslip by ID
  getPayslipById: async (id: number): Promise<Payslip> => {
    const response = await api.get(`/payroll/payslips/${id}`);
    return response.data;
  },

  // Download payslip PDF
  downloadPayslip: async (id: number): Promise<Blob> => {
    const response = await api.get(`/payroll/payslips/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get all payroll runs
  getAllRuns: async (): Promise<PayrollRun[]> => {
    const response = await api.get('/payroll/runs/');
    return response.data;
  },

  // Get payroll run by ID
  getRunById: async (id: number): Promise<PayrollRun> => {
    const response = await api.get(`/payroll/runs/${id}`);
    return response.data;
  },

  // Create payroll run
  createRun: async (data: { period_start: string; period_end: string }): Promise<PayrollRun> => {
    const response = await api.post('/payroll/runs/', data);
    return response.data;
  },

  // Process payroll run
  processRun: async (id: number): Promise<PayrollRun> => {
    const response = await api.post(`/payroll/runs/${id}/process`);
    return response.data;
  },

  // Export payroll run
  exportRun: async (id: number): Promise<Blob> => {
    const response = await api.get(`/payroll/runs/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
