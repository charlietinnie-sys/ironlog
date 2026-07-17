import { createElement, useState } from 'react';
import htm from 'htm';
const html = htm.bind(createElement);
import { getPlans, addPlan, updatePlan, deletePlan } from '../db.js';
import { generateId, COMMON_EXERCISES } from '../utils.js';

export default function PlanManager({ onChange }) {
  const [plans, setPlans] = useState(getPlans());
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [planName, setPlanName] = useState('');
  const [items, setItems] = useState([]);

  const refresh = () => {
    setPlans(getPlans());
    onChange();
  };

  const startNew = () => {
    setEditingPlan(null);
    setIsCreating(true);
    setPlanName('');
    setItems([]);
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setIsCreating(false);
    setPlanName('');
    setItems([]);
  };

  const startEdit = (plan) => {
    setIsCreating(false);
    setEditingPlan(plan);
    setPlanName(plan.name);
    setItems([...plan.items]);
  };

  const savePlan = () => {
    if (!planName.trim() || items.length === 0) return;
    const plan = {
      id: editingPlan ? editingPlan.id : generateId(),
      name: planName.trim(),
      items: items.map(it => ({
        exercise: it.exercise.trim(),
        equipment: it.equipment.trim() || '徒手/自由重量',
        weight: Number(it.weight) || 0,
        weightUnit: it.weightUnit || 'kg',
        sets: Number(it.sets) || 0,
        reps: Number(it.reps) || 0,
      })),
    };
    if (editingPlan) {
      updatePlan(plan);
    } else {
      addPlan(plan);
    }
    setEditingPlan(null);
    setIsCreating(false);
    setPlanName('');
    setItems([]);
    refresh();
  };

  const handleDelete = (id) => {
    if (confirm('确定删除这套训练计划？')) {
      deletePlan(id);
      refresh();
    }
  };

  const addItem = () => {
    setItems([...items, { exercise: '', equipment: '', weight: '', weightUnit: 'kg', sets: '', reps: '' }]);
  };

  const updateItem = (idx, field, value) => {
    const next = items.slice();
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const removeItem = (idx) => {
    const next = items.slice();
    next.splice(idx, 1);
    setItems(next);
  };

  if (editingPlan !== null || isCreating) {
    return html`
      <div>
        <h2 className="text-lg font-semibold mb-4">${editingPlan ? '编辑计划' : '新建计划'}</h2>
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs text-muted mb-1">计划名称</label>
            <input
              type="text"
              value=${planName}
              onChange=${e => setPlanName(e.target.value)}
              placeholder="例如：臀腿A"
              className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted">动作列表 (${items.length})</h3>
          <button
            onClick=${addItem}
            className="px-3 py-1.5 text-sm bg-accent text-dark font-medium rounded-lg active:scale-[0.98] transition-transform"
          >
            + 添加动作
          </button>
        </div>

        <div className="space-y-3 mb-4">
          ${items.map((item, idx) => html`
            <div key=${idx} className="bg-card border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value=${item.exercise}
                  onChange=${e => updateItem(idx, 'exercise', e.target.value)}
                  placeholder="动作名称"
                  list="common-exercises"
                  className="flex-1 bg-dark border border-border rounded-lg px-3 py-2 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
                />
                <button
                  onClick=${() => removeItem(idx)}
                  className="px-2 py-2 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  删除
                </button>
              </div>
              <input
                type="text"
                value=${item.equipment}
                onChange=${e => updateItem(idx, 'equipment', e.target.value)}
                placeholder="器械（可选）"
                className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value=${item.weight}
                  onChange=${e => updateItem(idx, 'weight', e.target.value)}
                  placeholder="重量"
                  className="bg-dark border border-border rounded-lg px-3 py-2 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
                />
                <select
                  value=${item.weightUnit || 'kg'}
                  onChange=${e => updateItem(idx, 'weightUnit', e.target.value)}
                  className="bg-dark border border-border rounded-lg px-3 py-2 text-white focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
                <input
                  type="number"
                  value=${item.sets}
                  onChange=${e => updateItem(idx, 'sets', e.target.value)}
                  placeholder="组数"
                  className="bg-dark border border-border rounded-lg px-3 py-2 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
                />
                <input
                  type="number"
                  value=${item.reps}
                  onChange=${e => updateItem(idx, 'reps', e.target.value)}
                  placeholder="次数"
                  className="bg-dark border border-border rounded-lg px-3 py-2 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>
          `)}
        </div>

        <div className="flex gap-3">
          <button
            onClick=${savePlan}
            disabled=${!planName.trim() || items.length === 0 || items.some(i => !i.exercise)}
            className="flex-1 bg-accent text-dark font-semibold py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            保存计划
          </button>
          <button
            onClick=${cancelEdit}
            className="px-4 py-3 bg-card border border-border rounded-lg text-muted hover:text-white transition-colors"
          >
            取消
          </button>
        </div>

        <datalist id="common-exercises">
          ${COMMON_EXERCISES.map(e => html`<option key=${e} value=${e} />`)}
        </datalist>
      </div>
    `;
  }

  return html`
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">训练计划</h2>
        <button
          onClick=${startNew}
          className="px-3 py-1.5 text-sm bg-accent text-dark font-medium rounded-lg active:scale-[0.98] transition-transform"
        >
          + 新建计划
        </button>
      </div>

      ${plans.length === 0 && html`
        <div className="text-center py-12 text-muted">
          <p className="text-sm">还没有训练计划</p>
          <p className="text-xs mt-1">创建几套计划，训练时一键加载</p>
        </div>
      `}

      <div className="space-y-3">
        ${plans.map(plan => html`
          <div key=${plan.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">${plan.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick=${() => startEdit(plan)}
                  className="px-2 py-1 text-xs bg-dark border border-border rounded-lg text-muted hover:text-white transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick=${() => handleDelete(plan.id)}
                  className="px-2 py-1 text-xs text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
            <div className="space-y-1">
              ${plan.items.map((item, idx) => html`
                <div key=${idx} className="text-sm text-muted flex items-center gap-2">
                  <span className="text-white">${item.exercise}</span>
                  <span className="text-xs">${item.equipment}</span>
                  <span className="text-accent">${item.weight}${item.weightUnit || 'kg'}</span>
                  <span className="text-xs">${item.sets}x${item.reps}</span>
                </div>
              `)}
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
}
