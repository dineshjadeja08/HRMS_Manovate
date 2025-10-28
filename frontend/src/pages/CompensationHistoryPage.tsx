import React, { useState, useEffect } from 'react';
import { compensationService, type CompensationHistory } from '../services/compensationService';
import { employeeService } from '../services/employeeService';
import type { Employee } from '../types';
import PrimaryButton from '../components/UI/PrimaryButton';
import { showSuccess, showError, showWarning } from '../utils/toast';
import { 
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const CompensationHistoryPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [history, setHistory] = useState<CompensationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompensation, setNewCompensation] = useState({
    salary: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadHistory(selectedEmployee);
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

  const loadHistory = async (employeeId: number) => {
    try {
      setLoading(true);
      const data = await compensationService.getCompensationHistory(employeeId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load compensation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompensation = async () => {
    if (!selectedEmployee || !newCompensation.salary || !newCompensation.reason) {
      showWarning('Please fill in all required fields');
      return;
    }

    try {
      await compensationService.addCompensationChange(
        selectedEmployee,
        parseFloat(newCompensation.salary),
        newCompensation.effectiveDate,
        newCompensation.reason
      );
      setShowAddModal(false);
      setNewCompensation({
        salary: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      loadHistory(selectedEmployee);
      showSuccess('Compensation change added successfully');
    } catch (error) {
      console.error('Failed to add compensation change:', error);
      showError('Failed to add compensation change');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateChange = (index: number) => {
    if (index === history.length - 1) return null;
    const current = history[index];
    const previous = history[index + 1];
    const change = current.salary - previous.salary;
    const percentage = ((change / previous.salary) * 100).toFixed(1);
    return { amount: change, percentage };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Compensation History</h1>
        <p className="text-slate-500 mt-1">Track salary changes and compensation history</p>
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
                  {emp.salary && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Current: {formatCurrency(emp.salary)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compensation History */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedEmployee ? (
            <div className="bg-white rounded-xl shadow-card p-12 text-center">
              <CurrencyDollarIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Select an employee to view compensation history</p>
            </div>
          ) : (
            <>
              {/* Current Salary Card */}
              {selectedEmployeeData && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 text-sm font-medium">Current Salary</p>
                      <p className="text-green-900 text-4xl font-bold mt-2">
                        {selectedEmployeeData.salary
                          ? formatCurrency(selectedEmployeeData.salary)
                          : 'Not set'}
                      </p>
                      <p className="text-green-700 text-sm mt-2">
                        {selectedEmployeeData.first_name} {selectedEmployeeData.last_name}
                      </p>
                    </div>
                    <div>
                      <PrimaryButton onClick={() => setShowAddModal(true)}>
                        <PlusIcon className="h-5 w-5 mr-2 inline" />
                        Add Change
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              )}

              {/* History Timeline */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Salary Change History</h2>

                {loading ? (
                  <div className="text-center py-12 text-slate-500">Loading history...</div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No compensation history available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((record, index) => {
                      const change = calculateChange(index);
                      return (
                        <div
                          key={record.id}
                          className="border-l-4 border-primary-500 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="bg-primary-100 rounded-full p-2">
                                  <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-slate-900">
                                    {formatCurrency(record.salary)}
                                  </p>
                                  {change && (
                                    <p
                                      className={`text-sm font-medium ${
                                        change.amount > 0 ? 'text-green-600' : 'text-red-600'
                                      }`}
                                    >
                                      {change.amount > 0 ? '+' : ''}
                                      {formatCurrency(change.amount)} ({change.percentage}%)
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-3 ml-11">
                                <p className="text-sm font-medium text-slate-700">Reason:</p>
                                <p className="text-sm text-slate-600 mt-1">{record.reason}</p>
                                
                                <p className="text-xs text-slate-400 mt-2">
                                  Effective Date: {formatDate(record.effective_date)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                {index === 0 ? 'Current' : `${index} changes ago`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Compensation Modal */}
      {showAddModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Compensation Change</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Salary *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                  <input
                    type="number"
                    value={newCompensation.salary}
                    onChange={(e) =>
                      setNewCompensation({ ...newCompensation, salary: e.target.value })
                    }
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="50000"
                    step="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={newCompensation.effectiveDate}
                  onChange={(e) =>
                    setNewCompensation({ ...newCompensation, effectiveDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={newCompensation.reason}
                  onChange={(e) =>
                    setNewCompensation({ ...newCompensation, reason: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Annual increment, Promotion, Performance bonus"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <PrimaryButton onClick={handleAddCompensation}>
                  Add Change
                </PrimaryButton>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-slate-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompensationHistoryPage;
