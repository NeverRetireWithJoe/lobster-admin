import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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
    return <div className="text-center py-12">載入中...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-orange-400">📊 儀表板</h1>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="👥"
          title="總用戶數"
          value={stats?.totalUsers || 0}
          color="blue"
        />
        <StatCard
          icon="💰"
          title="付費用戶"
          value={stats?.paidUsers || 0}
          color="green"
        />
        <StatCard
          icon="💵"
          title="月營收"
          value={`NT$${stats?.monthlyRevenue || 0}`}
          color="orange"
        />
        <StatCard
          icon="📨"
          title="今日訊息"
          value={stats?.dailyMessages || 0}
          color="purple"
        />
      </div>

      {/* API Token 用量 */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">🔑 API Token 用量（本月）</h2>
        <div className="text-3xl font-bold text-orange-400">
          {(stats?.apiTokenUsage || 0).toLocaleString()}
        </div>
        <div className="text-sm text-slate-400 mt-2">tokens</div>
      </div>

      {/* 小龍蝦狀態 */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">🦞 小龍蝦狀態</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.bots?.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-900/50 border-blue-700',
    green: 'bg-green-900/50 border-green-700',
    orange: 'bg-orange-900/50 border-orange-700',
    purple: 'bg-purple-900/50 border-purple-700',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-6`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}

function BotCard({ bot }) {
  const isOnline = bot.status === 'online';

  return (
    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold">{bot.name}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
          {isOnline ? '在線' : '離線'}
        </span>
      </div>
      <div className="space-y-2 text-sm text-slate-300">
        <div>用戶數：{bot.user_count}</div>
        <div>今日訊息：{bot.daily_messages}</div>
      </div>
    </div>
  );
}

export default Dashboard;
