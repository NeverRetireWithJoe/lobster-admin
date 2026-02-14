import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('獲取統計資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">載入中...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-400">📊 即時儀表板</h1>
        <button onClick={fetchStats} className="text-sm text-slate-400 hover:text-white">🔄 刷新</button>
      </div>

      {/* 即時統計卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon="👥" title="實際用戶" value={stats?.totalUniqueUsers || 0} sub="不重複 Telegram 用戶" color="blue" />
        <StatCard icon="💬" title="總 Sessions" value={stats?.totalSessions || 0} sub="所有對話數" color="green" />
        <StatCard icon="🪙" title="總 Tokens" value={formatNumber(stats?.totalTokens || 0)} sub={`入:${formatNumber(stats?.totalInputTokens||0)} / 出:${formatNumber(stats?.totalOutputTokens||0)}`} color="purple" />
        <StatCard icon="📊" title="財經訂閱" value={stats?.totalSubscribers || 0} sub="活躍訂閱者" color="orange" />
      </div>

      {/* 成本分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-base font-semibold mb-3 text-green-400">💰 API 成本估算（DeepSeek）</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-bold text-green-400">${stats?.estimatedCostUSD || '0.00'}</div>
              <div className="text-xs text-slate-400">USD</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">NT${stats?.estimatedCostTWD || 0}</div>
              <div className="text-xs text-slate-400">TWD</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">入 $0.28/M · 出 $0.42/M</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-base font-semibold mb-3 text-orange-400">💵 營收追蹤</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-bold">NT${stats?.monthlyRevenue || 0}</div>
              <div className="text-xs text-slate-400">月營收</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.paidUsers || 0}</div>
              <div className="text-xs text-slate-400">付費用戶</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            毛利：NT${Math.max(0, (stats?.monthlyRevenue || 0) - (stats?.estimatedCostTWD || 0))}
            {stats?.monthlyRevenue > 0 && ` (${Math.round((1 - (stats?.estimatedCostTWD || 0) / stats.monthlyRevenue) * 100)}%)`}
          </div>
        </div>
      </div>

      {/* 3 隻小龍蝦即時狀態 */}
      <h2 className="text-lg font-semibold mb-3 text-orange-400">🦞 小龍蝦即時狀態</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats?.bots?.map((bot) => (
          <BotCard key={bot.id} bot={bot} />
        ))}
      </div>

      {/* 所有用戶活動 */}
      <h2 className="text-lg font-semibold mb-3 text-orange-400">👥 用戶活動明細</h2>
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">龍蝦</th>
              <th className="px-3 py-2 text-left">用戶</th>
              <th className="px-3 py-2 text-right">Tokens</th>
              <th className="px-3 py-2 text-right">最後活躍</th>
            </tr>
          </thead>
          <tbody>
            {stats?.bots?.flatMap(bot => 
              bot.users.map(user => (
                <tr key={`${bot.id}-${user.telegramId}`} className="border-t border-slate-700 hover:bg-slate-750">
                  <td className="px-3 py-2 text-orange-400">{bot.name}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{user.name || user.telegramId}</div>
                    <div className="text-xs text-slate-500">ID: {user.telegramId}</div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{formatNumber(user.totalTokens || user.tokens || 0)}</td>
                  <td className="px-3 py-2 text-right text-xs text-slate-400">{formatTime(user.lastActive)}</td>
                </tr>
              ))
            )}
            {(!stats?.bots || stats.bots.every(b => b.users.length === 0)) && (
              <tr><td colSpan="4" className="px-3 py-6 text-center text-slate-500">尚無用戶活動</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-900/30 border-blue-800',
    green: 'bg-green-900/30 border-green-800',
    orange: 'bg-orange-900/30 border-orange-800',
    purple: 'bg-purple-900/30 border-purple-800',
  };
  return (
    <div className={`${colors[color]} border rounded-lg p-3 md:p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-slate-400">{title}</div>
      <div className="text-xl md:text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function BotCard({ bot }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-semibold text-white">{bot.name}</span>
          <div className="text-xs text-slate-500">{bot.telegram}</div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${bot.online ? 'bg-green-600' : 'bg-red-600'}`}>
          {bot.online ? '在線' : '離線'}
        </span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">模型</span>
          <span className="text-cyan-400 font-mono text-xs">{bot.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">用戶</span>
          <span className="font-bold">{bot.userCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Sessions</span>
          <span>{bot.sessionCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Tokens</span>
          <span className="font-mono">{formatNumber(bot.totalTokens)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">訂閱者</span>
          <span>{bot.subscriberCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">最後活躍</span>
          <span className="text-xs">{formatTime(bot.lastActive)}</span>
        </div>
      </div>
    </div>
  );
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatTime(ts) {
  if (!ts || ts === 0) return 'N/A';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '剛剛';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分鐘前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小時前';
  return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default Dashboard;
