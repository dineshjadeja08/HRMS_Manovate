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
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: HomeIcon,
    },
    {
      name: 'My Leave',
      path: '/leave',
      icon: CalendarIcon,
    },
    {
      name: 'Team Leave',
      path: '/team-leave',
      icon: ClockIcon,
      roles: ['MANAGER', 'HR_ADMIN'],
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: UserGroupIcon,
      roles: ['HR_ADMIN'],
    },
    {
      name: 'Payroll',
      path: '/payroll',
      icon: CurrencyDollarIcon,
      roles: ['HR_ADMIN'],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: ChartBarIcon,
      roles: ['HR_ADMIN', 'EXECUTIVE'],
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
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
      <nav className="p-4 space-y-2">
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
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
