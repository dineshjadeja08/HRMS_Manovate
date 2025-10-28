import React, { useState, useEffect } from 'react';
import { payrollService } from '../services/payrollService';
import type { PayrollRun } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import PrimaryButton from '../components/UI/PrimaryButton';
import { PlayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const PayrollPage: React.FC = () => {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    period_start: '',
    period_end: '',
  });

  useEffect(() => {
    loadPayrollRuns();
  }, []);

  const loadPayrollRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getAllRuns();
      setPayrollRuns(data);
    } catch (error) {
      console.error('Failed to load payroll runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      period_start: '',
      period_end: '',
    });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePayrollRun = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await payrollService.createRun(formData);
      await loadPayrollRuns();
      closeCreateModal();
    } catch (error) {
      console.error('Failed to create payroll run:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayroll = async (runId: number) => {
    if (!confirm('Are you sure you want to process this payroll run? This action cannot be undone.')) {
      return;
    }

    try {
      await payrollService.processRun(runId);
      await loadPayrollRuns();
    } catch (error) {
      console.error('Failed to process payroll run:', error);
    }
  };

  const handleExportPayroll = async (runId: number) => {
    try {
      const blob = await payrollService.exportRun(runId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_run_${runId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export payroll run:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading payroll data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Payroll Management</h1>
        <PrimaryButton onClick={openCreateModal}>
          <PlayIcon className="h-5 w-5 mr-2 inline" />
          Create Payroll Run
        </PrimaryButton>
      </div>

      {/* Payroll Runs Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Run ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Gross
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Net
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {payrollRuns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                    No payroll runs found. Create a new payroll run to get started.
                  </td>
                </tr>
              ) : (
                payrollRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      #{run.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(run.period_start).toLocaleDateString()} - {new Date(run.period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${run.total_gross?.toLocaleString() || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${run.total_deductions?.toLocaleString() || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-cyan-400">
                      ${run.total_net?.toLocaleString() || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {run.payslips?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(run.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {run.status === 'DRAFT' && (
                        <button
                          onClick={() => handleProcessPayroll(run.id)}
                          className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Process
                        </button>
                      )}
                      {run.status === 'PROCESSED' && (
                        <button
                          onClick={() => handleExportPayroll(run.id)}
                          className="inline-flex items-center px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                          Export
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payroll Run Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Create Payroll Run
            </h3>
            
            <form onSubmit={handleCreatePayrollRun} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Period Start Date *
                </label>
                <input
                  type="date"
                  name="period_start"
                  value={formData.period_start}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Period End Date *
                </label>
                <input
                  type="date"
                  name="period_end"
                  value={formData.period_end}
                  onChange={handleInputChange}
                  required
                  min={formData.period_start}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="bg-gray-700 rounded-md p-4 mt-4">
                <p className="text-sm text-gray-300">
                  <strong>Note:</strong> This will create a draft payroll run for all active employees. 
                  You can review and process it after creation.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Run'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
