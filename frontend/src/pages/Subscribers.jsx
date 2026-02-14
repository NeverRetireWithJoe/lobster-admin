import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ telegram_id: '', name: '' });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await api.get('/subscribers');
      setSubscribers(response.data);
    } catch (error) {
      console.error('獲取訂閱者失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSubscriber.telegram_id) {
      alert('請輸入 Telegram ID');
      return;
    }

    try {
      await api.post('/subscribers', newSubscriber);
      setShowModal(false);
      setNewSubscriber({ telegram_id: '', name: '' });
      fetchSubscribers();
    } catch (error) {
      alert(error.response?.data?.error || '新增失敗');
    }
  };

  const handleDelete = async (telegram_id) => {
    if (!confirm('確定要移除此訂閱者？')) return;

    try {
      await api.delete(`/subscribers/${telegram_id}`);
      fetchSubscribers();
    } catch (error) {
      alert('移除失敗');
    }
  };

  if (loading) {
    return <div className="text-center py-12">載入中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-400">📈 財經訂閱管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          ➕ 新增訂閱者
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="mb-4">
          <div className="text-sm text-slate-400">總訂閱人數</div>
          <div className="text-3xl font-bold text-orange-400">{subscribers.length}</div>
        </div>

        <div className="space-y-2">
          {subscribers.length === 0 ? (
            <div className="text-center text-slate-400 py-8">暫無訂閱者</div>
          ) : (
            subscribers.map((subscriber) => (
              <div
                key={subscriber}
                className="flex items-center justify-between bg-slate-700 rounded-lg p-4"
              >
                <div>
                  <div className="font-semibold">{subscriber}</div>
                  <div className="text-sm text-slate-400">Telegram ID</div>
                </div>
                <button
                  onClick={() => handleDelete(subscriber)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  移除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">新增訂閱者</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Telegram ID *</label>
                <input
                  type="text"
                  value={newSubscriber.telegram_id}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, telegram_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="輸入 Telegram ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">名稱（選填）</label>
                <input
                  type="text"
                  value={newSubscriber.name}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="輸入名稱"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  新增
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscribers;
