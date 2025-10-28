import api from './api';

export interface EmployeeDocument {
  id: number;
  employee_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  uploaded_by: number;
}

export const documentService = {
  // Upload document for employee
  uploadDocument: async (
    employeeId: number, 
    file: File, 
    documentType: string
  ): Promise<EmployeeDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await api.post(`/employees/${employeeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents for employee
  getEmployeeDocuments: async (employeeId: number): Promise<EmployeeDocument[]> => {
    const response = await api.get(`/employees/${employeeId}/documents`);
    return response.data;
  },

  // Download document
  downloadDocument: async (employeeId: number, documentId: number): Promise<Blob> => {
    const response = await api.get(`/employees/${employeeId}/documents/${documentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (employeeId: number, documentId: number): Promise<void> => {
    await api.delete(`/employees/${employeeId}/documents/${documentId}`);
  },
};
