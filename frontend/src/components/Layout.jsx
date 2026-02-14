import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

function Layout({ onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/', label: '儀表板', icon: '📊' },
    { path: '/users', label: '用戶管理', icon: '👥' },
    { path: '/plans', label: '方案管理', icon: '💎' },
    { path: '/bots', label: '龍蝦控制', icon: '🦞' },
    { path: '/subscribers', label: '財經訂閱', icon: '📈' },
    { path: '/settings', label: '系統設定', icon: '⚙️' },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-900">
      {/* 手機版遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 側邊欄 */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-56 bg-slate-800 border-r border-slate-700
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        flex flex-col
      `}>
        <div className="p-4">
          <h1 className="text-xl font-bold text-orange-400">🦞 小龍蝦管理</h1>
          <p className="text-xs text-slate-400 mt-1">付費系統後台</p>
        </div>

        <nav className="flex-1 mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ${
                location.pathname === item.path ? 'bg-slate-700 text-white border-l-4 border-orange-400' : ''
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            🚪 登出
          </button>
        </div>
      </aside>

      {/* 主內容區 */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* 手機版頂部導航列 */}
        <div className="md:hidden sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white text-2xl"
          >
            ☰
          </button>
          <span className="text-orange-400 font-bold">🦞 小龍蝦管理</span>
          <div className="w-8"></div>
        </div>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
