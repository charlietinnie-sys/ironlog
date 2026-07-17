import { createElement, useState, useEffect } from 'react';
import htm from 'htm';
const html = htm.bind(createElement);
import { getWorkoutsByDate, addWorkout, deleteWorkout, updateWorkout, getPlans, getDayMeta, setDayMeta } from '../db.js';
import { generateId, todayStr, COMMON_EXERCISES } from '../utils.js';

export default function TodayWorkout({ onChange, initialDate }) {
  const [workouts, setWorkouts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr());
  const [editingId, setEditingId] = useState(null);

  const [exercise, setExercise] = useState('');
  const [equipment, setEquipment] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [duration, setDuration] = useState('');
  const [maxHeartRate, setMaxHeartRate] = useState('');
  const [avgHeartRate, setAvgHeartRate] = useState('');

  useEffect(() => {
    refresh();
  }, [selectedDate]);

  const refresh = () => {
    setWorkouts(getWorkoutsByDate(selectedDate));
    setPlans(getPlans());
    const meta = getDayMeta(selectedDate);
    setDuration(meta.duration ? String(meta.duration) : '');
    setMaxHeartRate(meta.maxHeartRate ? String(meta.maxHeartRate) : '');
    setAvgHeartRate(meta.avgHeartRate ? String(meta.avgHeartRate) : '');
    setEditingId(null);
    setExercise('');
    setEquipment('');
    setWeight('');
    setWeightUnit('kg');
    setSets('');
    setReps('');
    setNote('');
  };

  const handleAdd = () => {
    if (!exercise || !weight || !sets || !reps) return;
    addWorkout({
      id: generateId(),
      date: selectedDate,
      exercise: exercise.trim(),
      equipment: equipment.trim() || '徒手/自由重量',
      weight: Number(weight),
      weightUnit: weightUnit || 'kg',
      sets: Number(sets),
      reps: Number(reps),
      note: note.trim(),
    });
    refresh();
    onChange();
  };

  const handleUpdate = () => {
    if (!editingId || !exercise || !weight || !sets || !reps) return;
    updateWorkout({
      id: editingId,
      date: selectedDate,
      exercise: exercise.trim(),
      equipment: equipment.trim() || '徒手/自由重量',
      weight: Number(weight),
      weightUnit: weightUnit || 'kg',
      sets: Number(sets),
      reps: Number(reps),
      note: note.trim(),
    });
    refresh();
    onChange();
  };

  const handleDelete = (id) => {
    if (confirm('确定删除这条记录？')) {
      deleteWorkout(id);
      refresh();
      onChange();
    }
  };

  const handleEdit = (w) => {
    setEditingId(w.id);
    setExercise(w.exercise);
    setEquipment(w.equipment);
    setWeight(String(w.weight));
    setWeightUnit(w.weightUnit || 'kg');
    setSets(String(w.sets));
    setReps(String(w.reps));
    setNote(w.note || '');
    setShowSuggestions(false);
  };

  const handleSaveMeta = () => {
    setDayMeta(selectedDate, {
      duration: duration ? Number(duration) : null,
      maxHeartRate: maxHeartRate ? Number(maxHeartRate) : null,
      avgHeartRate: avgHeartRate ? Number(avgHeartRate) : null,
    });
    onChange();
  };

  const loadPlan = (plan) => {
    plan.items.forEach(item => {
      addWorkout({
        id: generateId(),
        date: selectedDate,
        exercise: item.exercise,
        equipment: item.equipment,
        weight: Number(item.weight) || 0,
        weightUnit: item.weightUnit || 'kg',
        sets: Number(item.sets) || 0,
        reps: Number(item.reps) || 0,
        note: '',
      });
    });
    setDayMeta(selectedDate, { planName: plan.name });
    setShowPlanPicker(false);
    refresh();
    onChange();
  };

  const volume = workouts.reduce((sum, w) => sum + w.weight * w.sets * w.reps, 0);

  const filteredExercises = COMMON_EXERCISES.filter(e =>
    exercise && e.includes(exercise) && e !== exercise
  ).slice(0, 6);

  return html`
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">${selectedDate === todayStr() ? '今日训练' : formatDateDisplay(selectedDate)}</h2>
          <input
            type="date"
            value=${selectedDate}
            onChange=${e => setSelectedDate(e.target.value)}
            max=${todayStr()}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          ${plans.length > 0 && html`
            <button
              onClick=${() => setShowPlanPicker(!showPlanPicker)}
              className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg text-accent hover:border-accent transition-colors"
            >
              加载计划
            </button>
          `}
        </div>
      </div>

      ${showPlanPicker && plans.length > 0 && html`
        <div className="mb-4 p-3 bg-card border border-border rounded-xl">
          <p className="text-xs text-muted mb-2">选择一套训练计划加载：</p>
          <div className="flex flex-wrap gap-2">
            ${plans.map(plan => html`
              <button
                key=${plan.id}
                onClick=${() => loadPlan(plan)}
                className="px-3 py-1.5 text-sm bg-dark border border-border rounded-lg text-white hover:border-accent transition-colors"
              >
                ${plan.name}
              </button>
            `)}
          </div>
        </div>
      `}

      <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
        <div className="relative">
          <label className="block text-xs text-muted mb-1">动作名称</label>
          <input
            type="text"
            value=${exercise}
            onChange=${e => { setExercise(e.target.value); setShowSuggestions(true); }}
            onFocus=${() => setShowSuggestions(true)}
            onBlur=${() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="例如：臀推"
            className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
          />
          ${showSuggestions && filteredExercises.length > 0 && html`
            <div className="absolute z-10 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
              ${filteredExercises.map(e => html`
                <button
                  key=${e}
                  onClick=${() => { setExercise(e); setShowSuggestions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-dark transition-colors"
                >
                  ${e}
                </button>
              `)}
            </div>
          `}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">器械</label>
          <input
            type="text"
            value=${equipment}
            onChange=${e => setEquipment(e.target.value)}
            placeholder="例如：史密斯机"
            className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">重量</label>
            <input
              type="number"
              value=${weight}
              onChange=${e => setWeight(e.target.value)}
              placeholder="80"
              className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">单位</label>
            <select
              value=${weightUnit}
              onChange=${e => setWeightUnit(e.target.value)}
              className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white focus:border-accent focus:outline-none transition-colors"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">组数</label>
            <input
              type="number"
              value=${sets}
              onChange=${e => setSets(e.target.value)}
              placeholder="5"
              className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">次数</label>
            <input
              type="number"
              value=${reps}
              onChange=${e => setReps(e.target.value)}
              placeholder="12"
              className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">备注（可选）</label>
          <input
            type="text"
            value=${note}
            onChange=${e => setNote(e.target.value)}
            placeholder="例如：最后一组力竭"
            className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick=${editingId ? handleUpdate : handleAdd}
          disabled=${!exercise || !weight || !sets || !reps}
          className="w-full bg-accent text-dark font-semibold py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          ${editingId ? '更新记录' : '添加记录'}
        </button>

        ${editingId && html`
          <button
            onClick=${refresh}
            className="w-full bg-card border border-border rounded-lg py-2 text-muted hover:text-white transition-colors"
          >
            取消编辑
          </button>
        `}
      </div>

      ${workouts.length > 0 && html`
        <div className="space-y-2">
          ${workouts.map(w => html`
            <div key=${w.id} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">${w.exercise}</span>
                    ${w.equipment && html`<span className="text-xs text-muted truncate">${w.equipment}</span>`}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm flex-wrap">
                    <span className="text-accent font-medium">${w.weight} ${w.weightUnit || 'kg'}</span>
                    <span className="text-white">${w.sets} 组</span>
                    <span className="text-white">${w.reps} 次</span>
                    ${w.note && html`<span className="text-xs text-muted truncate">${w.note}</span>`}
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick=${() => handleEdit(w)}
                    className="px-2 py-1.5 text-xs bg-dark border border-border rounded-lg text-muted hover:text-white transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick=${() => handleDelete(w.id)}
                    className="px-2 py-1.5 text-xs text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          `)}

          <div className="bg-card border border-border rounded-xl p-4 mt-4">
            <h4 className="text-xs text-muted mb-3">训练信息</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">训练时长（分钟）</label>
                <input
                  type="number"
                  value=${duration}
                  onChange=${e => setDuration(e.target.value)}
                  placeholder="60"
                  className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">最高心率</label>
                <input
                  type="number"
                  value=${maxHeartRate}
                  onChange=${e => setMaxHeartRate(e.target.value)}
                  placeholder="160"
                  className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">平均心率</label>
                <input
                  type="number"
                  value=${avgHeartRate}
                  onChange=${e => setAvgHeartRate(e.target.value)}
                  placeholder="130"
                  className="w-full bg-dark border border-border rounded-lg px-3 py-2.5 text-white placeholder-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>
            <button
              onClick=${handleSaveMeta}
              className="mt-3 w-full bg-accent text-dark font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-transform"
            >
              保存训练信息
            </button>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted">总容量：${volume.toLocaleString()} ${workouts[0]?.weightUnit || 'kg'}</span>
              <span className="text-muted">已记录 ${workouts.length} 条</span>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}