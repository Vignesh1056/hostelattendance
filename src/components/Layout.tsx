import React, { ReactNode } from 'react';
import { LogOut, Users, QrCode } from 'lucide-react';
import { getCurrentUser, logout } from '../utils/storage';

interface LayoutProps {
  children: ReactNode;
  title: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, onLogout }) => {
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                {user?.role === 'admin' ? <QrCode className="w-6 h-6 text-white" /> : <Users className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">
                  {user?.role === 'admin' ? 'Admin Portal' : `Welcome, ${user?.name}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
