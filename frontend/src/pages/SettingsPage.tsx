import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PrimaryButton from '../components/UI/PrimaryButton';
import InputField from '../components/UI/InputField';
import { KeyIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Implement password change API call
      // await authService.changePassword(passwordData.current_password, passwordData.new_password);
      
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' });
      console.error('Password change error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-card">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <UserCircleIcon className="h-5 w-5 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'password'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <KeyIcon className="h-5 w-5 inline mr-2" />
              Password
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                    {user?.email || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                    {user?.role || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Employee Number</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                    {user?.employee?.employee_number || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                    {user?.employee ? `${user.employee.first_name} ${user.employee.last_name}` : 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                    {user?.employee?.department?.name || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                  <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400">
                    {user?.employee?.position?.title || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-md p-4 mt-6">
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> To update your profile information, please contact your HR administrator.
                </p>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Change Password</h2>

              {message && (
                <div
                  className={`rounded-md p-4 ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <InputField
                  label="Current Password"
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                />

                <InputField
                  label="New Password"
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />

                <InputField
                  label="Confirm New Password"
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />

                <div className="bg-slate-50 rounded-md p-4 border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">
                    Password Requirements:
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                    <li>Minimum 8 characters</li>
                    <li>Mix of uppercase and lowercase letters recommended</li>
                    <li>Include numbers and special characters for better security</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <PrimaryButton type="submit" disabled={submitting}>
                    {submitting ? 'Changing Password...' : 'Change Password'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
