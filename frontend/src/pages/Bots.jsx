import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Bots() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);

  useEffect(() => {
    fetchBots();
    const interval = setInterval(fetchBots, 10000); // 每 10 秒更新
    return () => clearInterval(interval);
  }, []);

  const fetchBots = async () => {
    try {
      const response = await api.get('/bots/status');
      setBots(response.data);
    } catch (error) {
      console.error('獲取 Bot 狀態失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">載入中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-400">🦞 小龍蝦控制台</h1>
        <button
          onClick={() => setShowBroadcast(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          📢 發送廣播
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <BotPanel key={bot.id} bot={bot} />
        ))}
      </div>

      {showBroadcast && (
        <BroadcastModal
          bots={bots}
          onClose={() => setShowBroadcast(false)}
        />
      )}
    </div>
  );
}

function BotPanel({ bot }) {
  const isOnline = bot.status === 'online';

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{bot.name}</h2>
        <span className={`px-3 py-1 rounded-full text-sm ${
          isOnline ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {isOnline ? '🟢 在線' : '🔴 離線'}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-slate-400">綁定用戶</span>
          <span className="font-semibold">{bot.user_count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">今日訊息</span>
          <span className="font-semibold">{bot.daily_messages}</span>
        </div>
      </div>

      {bot.users && bot.users.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-slate-400">綁定用戶列表</h3>
          <div className="bg-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
            {bot.users.slice(0, 5).map((user) => (
              <div key={user.id} className="text-sm py-1 text-slate-300">
                {user.name || user.telegram_id}
              </div>
            ))}
            {bot.users.length > 5 && (
              <div className="text-xs text-slate-500 mt-2">
                還有 {bot.users.length - 5} 位用戶...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BroadcastModal({ bots, onClose }) {
  const [message, setMessage] = useState('');
  const [selectedBots, setSelectedBots] = useState(bots.map(b => b.id));
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      alert('請輸入訊息內容');
      return;
    }

    setSending(true);
    try {
      await api.post('/bots/broadcast', {
        message,
        targetBots: selectedBots
      });
      alert('廣播訊息已發送！');
      onClose();
    } catch (error) {
      alert('發送失敗');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-4">📢 發送廣播訊息</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">選擇目標 Bot</label>
            <div className="space-y-2">
              {bots.map(bot => (
                <label key={bot.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBots.includes(bot.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBots([...selectedBots, bot.id]);
                      } else {
                        setSelectedBots(selectedBots.filter(id => id !== bot.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>{bot.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">訊息內容</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
              placeholder="輸入要廣播的訊息..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSend}
              disabled={sending || selectedBots.length === 0}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? '發送中...' : '發送'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bots;
