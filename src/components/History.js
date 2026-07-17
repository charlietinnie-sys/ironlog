import { createElement, useState, useMemo } from 'react';
import htm from 'htm';
const html = htm.bind(createElement);
import { getWorkouts, getDayMeta, getPlans } from '../db.js';
import { formatDate, formatDateFull, getCalendarDays, PLAN_COLORS, todayStr } from '../utils.js';

export default function History({ onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDate, setExpandedDate] = useState(null);

  const workouts = getWorkouts();
  const plans = getPlans();

  const { year, month, calendarDays } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return {
      year: y,
      month: m,
      calendarDays: getCalendarDays(y, m)
    };
  }, [currentDate]);

  const workoutsByDate = useMemo(() => {
    const map = {};
    workouts.forEach(w => {
      if (!map[w.date]) map[w.date] = [];
      map[w.date].push(w);
    });
    return map;
  }, [workouts]);

  const dayMetaByDate = useMemo(() => {
    const meta = getData();
    return meta.dayMeta || {};
  }, []);

  function getData() {
    try {
      const raw = localStorage.getItem('ironlog_data');
      return raw ? JSON.parse(raw) : { workouts: [], plans: [], dayMeta: {} };
    } catch {
      return { workouts: [], plans: [], dayMeta: {} };
    }
  }

  const planColorMap = useMemo(() => {
    const map = {};
    plans.forEach((p, i) => {
      map[p.name] = PLAN_COLORS[i % PLAN_COLORS.length];
    });
    return map;
  }, [plans]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayInfo = (dateStr) => {
    const items = workoutsByDate[dateStr] || [];
    const meta = dayMetaByDate[dateStr] || {};
    return { items, meta };
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return html`
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick=${prevMonth}
            className="p-2 bg-card border border-border rounded-lg hover:border-accent transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <div className="text-lg font-semibold">${year}年${month + 1}月</div>
          </div>
          <button
            onClick=${nextMonth}
            className="p-2 bg-card border border-border rounded-lg hover:border-accent transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick=${goToToday}
          className="px-3 py-1.5 text-sm bg-accent text-dark font-semibold rounded-lg"
        >
          本月
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        ${weekDays.map(d => html`
          <div key=${d} className="text-center text-xs text-muted py-2">${d}</div>
        `)}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        ${calendarDays.map((day, idx) => {
          if (!day) {
            return html`<div key=${idx} className="aspect-square"></div>`;
          }
          const info = getDayInfo(day.date);
          const hasData = info.items.length > 0;
          const isToday = day.date === todayStr();
          const isSelected = expandedDate === day.date;
          const planName = info.meta.planName;
          const colorClass = planName ? planColorMap[planName] || 'bg-gray-500' : 'bg-accent/30';

          return html`
            <div
              key=${idx}
              onClick=${() => {
                if (hasData) {
                  setExpandedDate(expandedDate === day.date ? null : day.date);
                  onDateSelect?.(day.date);
                }
              }}
              className="relative aspect-square border border-border rounded-lg overflow-hidden cursor-pointer transition-all ${isToday ? 'border-accent' : ''} ${isSelected ? 'ring-2 ring-accent' : ''}"
            >
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-sm ${hasData ? 'text-white' : 'text-muted'}">${day.day}</span>
                </div>
                ${hasData && html`
                  <div className="flex-shrink-0 pb-0.5 px-0.5">
                    <div className="${colorClass} text-white text-[10px] px-1 py-0.5 rounded truncate text-center">
                      ${planName ? planName.substring(0, 6) : info.meta.duration ? `${info.meta.duration}min` : '训练'}
                    </div>
                  </div>
                `}
              </div>
            </div>
          `;
        })}
      </div>

      ${expandedDate && html`
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">${formatDateFull(expandedDate)}</h3>
            <button
              onClick=${() => setExpandedDate(null)}
              className="text-xs text-muted"
            >
              收起
            </button>
          </div>
          ${renderDayDetail(expandedDate)}
        </div>
      `}

      ${!expandedDate && workouts.length > 0 && html`
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted">最近训练</h3>
          ${[...new Set(workouts.map(w => w.date))].slice(0, 7).map(date => html`
            <div
              key=${date}
              onClick=${() => {
                setExpandedDate(date);
                onDateSelect?.(date);
              }}
              className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">${formatDate(date)}</span>
                <span className="text-xs text-muted">${workoutsByDate[date]?.length || 0} 条记录</span>
              </div>
            </div>
          `)}
        </div>
      `}

      ${workouts.length === 0 && html`
        <div className="text-center py-12">
          <div className="text-muted text-sm">暂无训练记录</div>
          <div className="text-muted text-xs mt-2">去"今日训练"添加第一条记录吧</div>
        </div>
      `}
    </div>
  `;
}

function renderDayDetail(dateStr) {
  const workouts = getWorkouts().filter(w => w.date === dateStr);
  const meta = getDayMeta(dateStr);

  const volume = workouts.reduce((sum, w) => sum + w.weight * w.sets * w.reps, 0);

  if (workouts.length === 0) {
    return html`
      <div className="text-center py-8 text-muted text-sm">当天没有训练记录</div>
    `;
  }

  return html`
    <div className="space-y-2">
      ${meta.planName && html`
        <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2">
          <span className="text-xs text-accent">训练计划：${meta.planName}</span>
        </div>
      `}
      ${workouts.map(w => html`
        <div key=${w.id} className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">${w.exercise}</div>
              ${w.equipment && html`
                <div className="text-xs text-muted mt-0.5">${w.equipment}</div>
              `}
            </div>
            <div className="text-right">
              <div className="text-accent font-medium">${w.weight} ${w.weightUnit || 'kg'}</div>
              <div className="text-xs text-white mt-0.5">${w.sets}组 x ${w.reps}次</div>
            </div>
          </div>
          ${w.note && html`
            <div className="mt-2 text-xs text-muted">${w.note}</div>
          `}
        </div>
      `)}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">总容量</span>
          <span className="text-accent font-medium">${volume.toLocaleString()} ${workouts[0]?.weightUnit || 'kg'}</span>
        </div>
        ${meta.duration && html`
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted">训练时长</span>
            <span className="text-white">${meta.duration} 分钟</span>
          </div>
        `}
        ${meta.maxHeartRate && html`
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted">最高心率</span>
            <span className="text-white">${meta.maxHeartRate} bpm</span>
          </div>
        `}
        ${meta.avgHeartRate && html`
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted">平均心率</span>
            <span className="text-white">${meta.avgHeartRate} bpm</span>
          </div>
        `}
      </div>
    </div>
  `;
}