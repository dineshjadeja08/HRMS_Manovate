import React from 'react';
import { UserGroupIcon, CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back!</p>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-slate-800">1,250</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Present Today</p>
              <p className="text-3xl font-bold text-slate-800">1,150</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">On Leave</p>
              <p className="text-3xl font-bold text-slate-800">25</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
