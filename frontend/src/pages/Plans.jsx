import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('獲取方案失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/plans', { plans });
      alert('方案更新成功！');
    } catch (error) {
      alert('更新失敗');
    }
  };

  const updatePlan = (index, field, value) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };

  const addPlan = () => {
    setPlans([...plans, {
      id: `plan_${Date.now()}`,
      name: '新方案',
      price: 0,
      userLimit: 1,
      dailyMessageLimit: 50,
      monthlyTokenLimit: 5000000,
      features: []
    }]);
  };

  const deletePlan = (index) => {
    if (!confirm('確定要刪除此方案？')) return;
    setPlans(plans.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="text-center py-12">載入中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-400">💎 方案管理</h1>
        <div className="space-x-3">
          <button
            onClick={addPlan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ➕ 新增方案
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            💾 儲存變更
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onUpdate={(field, value) => updatePlan(index, field, value)}
            onDelete={() => deletePlan(index)}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, onUpdate, onDelete }) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <input
          type="text"
          value={plan.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          className="text-xl font-bold bg-transparent border-b border-slate-600 focus:border-orange-400 outline-none"
        />
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-400"
          title="刪除方案"
        >
          🗑️
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">月費（NT$）</label>
          <input
            type="number"
            value={plan.price}
            onChange={(e) => onUpdate('price', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">人數上限</label>
          <input
            type="number"
            value={plan.userLimit}
            onChange={(e) => onUpdate('userLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">每日訊息上限</label>
          <input
            type="number"
            value={plan.dailyMessageLimit}
            onChange={(e) => onUpdate('dailyMessageLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">月 Token 上限</label>
          <input
            type="number"
            value={plan.monthlyTokenLimit}
            onChange={(e) => onUpdate('monthlyTokenLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
          <div className="text-xs text-slate-500 mt-1">
            {(plan.monthlyTokenLimit / 1000000).toFixed(1)}M tokens
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">功能列表（逗號分隔）</label>
          <input
            type="text"
            value={plan.features?.join(', ') || ''}
            onChange={(e) => onUpdate('features', e.target.value.split(',').map(f => f.trim()))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            placeholder="基本功能, 進階功能"
          />
        </div>
      </div>
    </div>
  );
}

export default Plans;
