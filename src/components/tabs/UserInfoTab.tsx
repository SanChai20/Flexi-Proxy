'use client';

import { usePathname } from 'next/navigation';

export default function UserInfoTab() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith('/zh') ? 'zh' : 'en';
  
  // In a real app, you would fetch translations server-side or with a more sophisticated client-side solution
  // For this example, we'll use a simplified approach
  const translations = {
    "userInfo": {
      "title": currentLocale === 'zh' ? "用户信息" : "User Information",
      "name": currentLocale === 'zh' ? "姓名" : "Full Name",
      "email": currentLocale === 'zh' ? "邮箱" : "Email Address",
      "phone": currentLocale === 'zh' ? "电话号码" : "Phone Number",
      "company": currentLocale === 'zh' ? "公司" : "Company",
      "bio": currentLocale === 'zh' ? "个人简介" : "Bio",
      "save": currentLocale === 'zh' ? "保存更改" : "Save Changes"
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{translations.userInfo.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.userInfo.name}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue="John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.userInfo.email}
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue="john.doe@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.userInfo.phone}
          </label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue="+1 (555) 123-4567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.userInfo.company}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue="Acme Inc."
          />
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.userInfo.bio}
        </label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          defaultValue="Software engineer with 5 years of experience in web development."
        />
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {translations.userInfo.save}
        </button>
      </div>
    </div>
  );
}