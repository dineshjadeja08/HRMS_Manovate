import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText,
  Menu,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'EXECUTIVE'],
  },
  {
    path: '/employees',
    label: 'Employees',
    icon: <Users className="w-5 h-5" />,
    roles: ['HR_ADMIN'],
  },
  {
    path: '/leave',
    label: 'Leave Management',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'],
  },
  {
    path: '/attendance',
    label: 'Attendance',
    icon: <Clock className="w-5 h-5" />,
    roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'],
  },
  {
    path: '/payroll',
    label: 'Payroll',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['HR_ADMIN'],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: <FileText className="w-5 h-5" />,
    roles: ['HR_ADMIN', 'EXECUTIVE'],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    hasRole(item.roles as any)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold text-primary">HRMS-MFM</h1>
        <p className="text-sm text-gray-400 mt-1">Human Resource Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:bg-dark-hover hover:text-gray-200'
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-dark-border">
          <div className="text-sm text-gray-400">
            <p className="font-medium text-gray-200">{`${user.first_name} ${user.last_name}`}</p>
            <p className="text-xs">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-card border border-dark-border text-gray-200"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen bg-dark-card border-r border-dark-border transition-transform duration-300 z-40',
          'w-64',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
};
