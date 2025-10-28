import api from './api';

export interface CompensationHistory {
  id: number;
  employee_id: number;
  salary: number;
  effective_date: string;
  reason: string;
  changed_by: number;
  created_at: string;
}

export const compensationService = {
  // Get compensation history for employee
  getCompensationHistory: async (employeeId: number): Promise<CompensationHistory[]> => {
    const response = await api.get(`/payroll/compensation/history/${employeeId}`);
    return response.data;
  },

  // Add compensation change
  addCompensationChange: async (
    employeeId: number,
    salary: number,
    effectiveDate: string,
    reason: string
  ): Promise<CompensationHistory> => {
    const response = await api.post(`/payroll/compensation/history/${employeeId}`, {
      salary,
      effective_date: effectiveDate,
      reason,
    });
    return response.data;
  },
};
