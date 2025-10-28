import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <Sidebar />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
