import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Settings() {
  const [settings, setSettings] = useState({
    trialDays: 7,
    trialDailyMessageLimit: 20,
    expiredDailyMessageLimit: 3,
    rateLimitSeconds: 2
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('獲取設定失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/settings', { settings });
      alert('設定更新成功！');
    } catch (error) {
      alert('更新失敗');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新密碼與確認密碼不符');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('密碼至少需要 6 個字元');
      return;
    }

    try {
      await api.put('/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('密碼修改成功！');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.error || '修改失敗');
    }
  };

  if (loading) {
    return <div className="text-center py-12">載入中...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-orange-400">⚙️ 系統設定</h1>

      <div className="space-y-6">
        {/* 方案限制設定 */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">📋 方案限制設定</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">免費試用天數</label>
              <input
                type="number"
                value={settings.trialDays}
                onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">試用期每日訊息限制</label>
              <input
                type="number"
                value={settings.trialDailyMessageLimit}
                onChange={(e) => setSettings({ ...settings, trialDailyMessageLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">過期用戶每日訊息限制</label>
              <input
                type="number"
                value={settings.expiredDailyMessageLimit}
                onChange={(e) => setSettings({ ...settings, expiredDailyMessageLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">頻率限制（秒/則）</label>
              <input
                type="number"
                value={settings.rateLimitSeconds}
                onChange={(e) => setSettings({ ...settings, rateLimitSeconds: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            💾 儲存設定
          </button>
        </div>

        {/* 修改密碼 */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">🔐 修改管理員密碼</h2>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">當前密碼</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">新密碼</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">確認新密碼</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              🔄 修改密碼
            </button>
          </form>
        </div>

        {/* 系統資訊 */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">ℹ️ 系統資訊</h2>
          <div className="space-y-2 text-slate-300">
            <div>版本：v1.0.0</div>
            <div>小龍蝦付費管理系統</div>
            <div>🦞 Built with React + Express + SQLite</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
