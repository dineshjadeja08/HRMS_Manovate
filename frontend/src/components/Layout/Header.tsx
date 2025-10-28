import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon, ArrowRightOnRectangleIcon, KeyIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-cyan-500">HRMS-MFM</h1>
          <span className="text-gray-500 text-sm">Human Resources Management System</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="text-right">
              <div className="text-sm font-medium text-white">{user?.email}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
            <UserCircleIcon className="w-8 h-8 text-cyan-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <div className="text-sm font-medium text-white">{user?.email}</div>
                <div className="text-xs text-gray-400 mt-1">Role: {user?.role}</div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to change password page
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <KeyIcon className="w-5 h-5" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-400 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
