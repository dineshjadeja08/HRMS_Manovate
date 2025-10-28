import React, { useState, useEffect } from 'react';
import { documentService, type EmployeeDocument } from '../services/documentService';
import { employeeService } from '../services/employeeService';
import type { Employee } from '../types';
import PrimaryButton from '../components/UI/PrimaryButton';
import StatusBadge from '../components/UI/StatusBadge';
import { 
  DocumentArrowUpIcon, 
  DocumentArrowDownIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const DocumentsPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const documentTypes = [
    'Resume',
    'Contract',
    'ID Proof',
    'Address Proof',
    'Educational Certificate',
    'Experience Letter',
    'Offer Letter',
    'Bank Details',
    'Other'
  ];

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadDocuments(selectedEmployee);
    }
  }, [selectedEmployee]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadDocuments = async (employeeId: number) => {
    try {
      setLoading(true);
      const data = await documentService.getEmployeeDocuments(employeeId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedEmployee || !selectedFile || !documentType) {
      alert('Please select employee, document type, and file');
      return;
    }

    try {
      setUploading(true);
      await documentService.uploadDocument(selectedEmployee, selectedFile, documentType);
      setSelectedFile(null);
      setDocumentType('');
      loadDocuments(selectedEmployee);
      alert('Document uploaded successfully');
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      const blob = await documentService.downloadDocument(doc.employee_id, doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (doc: EmployeeDocument) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(doc.employee_id, doc.id);
      loadDocuments(doc.employee_id);
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Document Management</h1>
        <p className="text-slate-500 mt-1">Upload and manage employee documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Select Employee</h2>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedEmployee === emp.id
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-slate-800">
                    {emp.first_name} {emp.last_name}
                  </div>
                  <div className="text-sm text-slate-500">{emp.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Document Upload & List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Upload Document</h2>
            
            {!selectedEmployee ? (
              <div className="text-center py-8 text-slate-500">
                Please select an employee to upload documents
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-slate-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <PrimaryButton
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !documentType}
                >
                  <DocumentArrowUpIcon className="h-5 w-5 mr-2 inline" />
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </PrimaryButton>
              </div>
            )}
          </div>

          {/* Documents List */}
          {selectedEmployee && (
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Employee Documents</h2>
              
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No documents uploaded for this employee
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Document Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Uploaded Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={doc.document_type} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {doc.file_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleDownload(doc)}
                              className="text-primary-600 hover:text-primary-800"
                              title="Download"
                            >
                              <DocumentArrowDownIcon className="h-5 w-5 inline" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
