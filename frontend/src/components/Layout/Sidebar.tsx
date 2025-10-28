import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  AcademicCapIcon,
  StarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: HomeIcon,
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: ClockIcon,
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: UserGroupIcon,
      roles: ['HR_ADMIN', 'MANAGER'],
    },
    {
      name: 'Leave',
      path: '/leave',
      icon: CalendarIcon,
    },
    {
      name: 'Payroll',
      path: '/payroll',
      icon: CurrencyDollarIcon,
      roles: ['HR_ADMIN'],
    },
    {
      name: 'Performance',
      path: '/performance',
      icon: StarIcon,
      roles: ['MANAGER', 'HR_ADMIN'],
    },
    {
      name: 'Training',
      path: '/training',
      icon: AcademicCapIcon,
    },
    {
      name: 'Team Attendance',
      path: '/team-attendance',
      icon: ClipboardDocumentCheckIcon,
      roles: ['MANAGER', 'HR_ADMIN'],
    },
    {
      name: 'Documents',
      path: '/documents',
      icon: DocumentTextIcon,
      roles: ['HR_ADMIN'],
    },
    {
      name: 'Compensation',
      path: '/compensation-history',
      icon: BanknotesIcon,
      roles: ['HR_ADMIN', 'EXECUTIVE'],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: ChartBarIcon,
      roles: ['HR_ADMIN', 'EXECUTIVE', 'MANAGER'],
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Cog6ToothIcon,
    },
  ];

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return user && roles.includes(user.role);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-semibold text-white">Manovate HR</h1>
        <p className="text-sm text-slate-400 mt-1">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (!hasAccess(item.roles)) return null;

          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
