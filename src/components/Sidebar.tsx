'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  UserIcon, 
  CreditCardIcon, 
  ArrowsRightLeftIcon, 
  CogIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout,
  sidebarOpen,
  setSidebarOpen
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith('/zh') ? 'zh' : 'en';
  


  const navigation = [
    { name: translations.dashboard.userInfo, id: 'user-info', icon: UserIcon },
    { name: translations.dashboard.subscription, id: 'subscription', icon: CreditCardIcon },
    { name: translations.dashboard.routing, id: 'routing', icon: ArrowsRightLeftIcon },
    { name: translations.dashboard.settings, id: 'settings', icon: CogIcon },
  ];

  const { isAuthenticated } = useAuth();

  // If user is not authenticated, don't render the sidebar
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">{translations.dashboard.openSidebar}</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" />
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">{translations.dashboard.dashboard}</h2>
              </div>
            </div>
            <button
              type="button"
              className="md:hidden p-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none z-50 relative"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">{translations.dashboard.closeSidebar}</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false); // Close mobile sidebar when a tab is selected
                  }}
                  className={`${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200`}
                >
                  <Icon
                    className={`${
                      activeTab === item.id ? 'text-indigo-700' : 'text-gray-500'
                    } flex-shrink-0 h-5 w-5 mr-3`}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-500 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {translations.dashboard.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for sidebar on desktop */}
      <div className="md:w-64 md:flex-shrink-0"></div>
    </>
  );
}