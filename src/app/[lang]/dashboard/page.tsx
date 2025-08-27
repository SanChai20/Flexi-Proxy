'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import UserInfoTab from '@/components/tabs/UserInfoTab';
import SubscriptionTab from '@/components/tabs/SubscriptionTab';
import RoutingTab from '@/components/tabs/RoutingTab';
import SettingsTab from '@/components/tabs/SettingsTab';

export default function Dashboard() {
  // const pathname = usePathname();
  // const currentLocale = pathname.startsWith('/zh') ? 'zh' : 'en';
  
  // // In a real app, you would fetch translations server-side or with a more sophisticated client-side solution
  // // For this example, we'll use a simplified approach
  // const translations = {
  //   "dashboard": {
  //     "userInfo": currentLocale === 'zh' ? "用户信息" : "User Info",
  //     "subscription": currentLocale === 'zh' ? "订阅" : "Subscription",
  //     "routing": currentLocale === 'zh' ? "路由" : "Routing",
  //     "settings": currentLocale === 'zh' ? "设置" : "Settings",
  //     "logout": currentLocale === 'zh' ? "退出登录" : "Logout"
  //   },
  //   "userInfo": {
  //     "title": currentLocale === 'zh' ? "用户信息" : "User Information"
  //   },
  //   "subscription": {
  //     "title": currentLocale === 'zh' ? "订阅" : "Subscription"
  //   },
  //   "routing": {
  //     "title": currentLocale === 'zh' ? "路由配置" : "Routing Configuration"
  //   },
  //   "settings": {
  //     "title": currentLocale === 'zh' ? "设置" : "Settings"
  //   }
  // };

  // const [activeTab, setActiveTab] = useState('user-info');
  // const [sidebarOpen, setSidebarOpen] = useState(false);


  // // Render the appropriate tab content based on the active tab
  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case 'user-info':
  //       return <UserInfoTab />;
  //     case 'subscription':
  //       return <SubscriptionTab />;
  //     case 'routing':
  //       return <RoutingTab />;
  //     case 'settings':
  //       return <SettingsTab />;
  //     default:
  //       return <UserInfoTab />;
  //   }
  // };

  // // Get the title for the current tab
  // const getTabTitle = () => {
  //   switch (activeTab) {
  //     case 'user-info':
  //       return translations.userInfo.title;
  //     case 'subscription':
  //       return translations.subscription.title;
  //     case 'routing':
  //       return translations.routing.title;
  //     case 'settings':
  //       return translations.settings.title;
  //     default:
  //       return '';
  //   }
  // };

  // return (
  //     <div className="flex h-screen bg-gray-50">
  //       {/* Sidebar */}
  //       <Sidebar 
  //         activeTab={activeTab} 
  //         setActiveTab={setActiveTab} 
  //         onLogout={logout}
  //         sidebarOpen={sidebarOpen}
  //         setSidebarOpen={setSidebarOpen}
  //       />
        
  //       {/* Main content */}
  //       <div className="flex-1 flex flex-col overflow-hidden relative z-0">
  //         {/* Header */}
  //         <header className="bg-white shadow">
  //           <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
  //             <h1 className="text-2xl font-bold text-gray-900">
  //               {getTabTitle()}
  //             </h1>
  //             <button
  //               onClick={logout}
  //               className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  //             >
  //               {translations.dashboard.logout}
  //             </button>
  //           </div>
  //         </header>
          
  //         {/* Tab Content */}
  //         <main className="flex-1 overflow-y-auto p-4 md:p-6">
  //           <div className="max-w-7xl mx-auto">
  //             {renderTabContent()}
  //           </div>
  //         </main>
  //       </div>
  //     </div>
  // );
}