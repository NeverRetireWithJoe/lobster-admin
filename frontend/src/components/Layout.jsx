import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

function Layout({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '📊 儀表板', icon: '📊' },
    { path: '/users', label: '👥 用戶管理', icon: '👥' },
    { path: '/plans', label: '💎 方案管理', icon: '💎' },
    { path: '/bots', label: '🦞 龍蝦控制', icon: '🦞' },
    { path: '/subscribers', label: '📈 財經訂閱', icon: '📈' },
    { path: '/settings', label: '⚙️ 系統設定', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* 側邊欄 */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
            🦞 小龍蝦管理
          </h1>
          <p className="text-sm text-slate-400 mt-1">付費系統後台</p>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ${
                location.pathname === item.path ? 'bg-slate-700 text-white border-l-4 border-orange-400' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            🚪 登出
          </button>
        </div>
      </aside>

      {/* 主內容區 */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
