import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('獲取用戶失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('獲取方案失敗:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此用戶？')) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert('刪除失敗');
    }
  };

  const filteredUsers = users.filter(user =>
    user.telegram_id.includes(searchTerm) || user.name?.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-400">👥 用戶管理</h1>
        <button
          onClick={() => { setEditUser(null); setShowModal(true); }}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          ➕ 新增用戶
        </button>
      </div>

      {/* 搜尋欄 */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜尋 Telegram ID 或名稱..."
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* 用戶列表 */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left">Telegram ID</th>
              <th className="px-6 py-3 text-left">名稱</th>
              <th className="px-6 py-3 text-left">方案</th>
              <th className="px-6 py-3 text-left">狀態</th>
              <th className="px-6 py-3 text-left">到期日</th>
              <th className="px-6 py-3 text-left">訊息量</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4">{user.telegram_id}</td>
                <td className="px-6 py-4">{user.name || '-'}</td>
                <td className="px-6 py-4">
                  {plans.find(p => p.id === user.plan_id)?.name || user.plan_id}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {user.status === 'active' ? '啟用' : '停用'}
                  </span>
                </td>
                <td className="px-6 py-4">{user.expiry_date || '-'}</td>
                <td className="px-6 py-4">{user.total_messages || 0}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => { setEditUser(user); setShowModal(true); }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserModal
          user={editUser}
          plans={plans}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}

function UserModal({ user, plans, onClose, onSave }) {
  const [formData, setFormData] = useState({
    telegram_id: user?.telegram_id || '',
    name: user?.name || '',
    plan_id: user?.plan_id || plans[0]?.id || '',
    status: user?.status || 'active',
    expiry_date: user?.expiry_date || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (user) {
        await api.put(`/users/${user.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      onSave();
    } catch (error) {
      alert(error.response?.data?.error || '操作失敗');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-4">{user ? '編輯用戶' : '新增用戶'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Telegram ID</label>
            <input
              type="text"
              value={formData.telegram_id}
              onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              required
              disabled={!!user}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">名稱</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">方案</label>
            <select
              value={formData.plan_id}
              onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">狀態</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="active">啟用</option>
              <option value="inactive">停用</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">到期日</label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              儲存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Users;
