import { createElement, useState, useEffect } from 'react';
import htm from 'htm';
const html = htm.bind(createElement);
import TodayWorkout from './components/TodayWorkout.js';
import PlanManager from './components/PlanManager.js';
import History from './components/History.js';
import ExportData from './components/ExportData.js';
import BottomNav from './components/BottomNav.js';

const TABS = [
  { key: 'today', label: '今日训练', icon: 'M' },
  { key: 'plans', label: '训练计划', icon: 'P' },
  { key: 'history', label: '历史记录', icon: 'H' },
  { key: 'export', label: '导出数据', icon: 'E' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  const refresh = () => setForceUpdate(v => v + 1);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setActiveTab('today');
  };

  return html`
    <div className="min-h-screen bg-dark pb-24" key=${forceUpdate}>
      <header className="sticky top-0 z-10 bg-dark/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-2xl text-accent tracking-wider">IRONLOG</h1>
        <span className="text-xs text-muted">铁记</span>
      </header>

      <main className="px-4 pt-4">
        ${activeTab === 'today' && html`<${TodayWorkout} onChange=${refresh} initialDate=${selectedDate} />`}
        ${activeTab === 'plans' && html`<${PlanManager} onChange=${refresh} />`}
        ${activeTab === 'history' && html`<${History} onDateSelect=${handleDateSelect} />`}
        ${activeTab === 'export' && html`<${ExportData} />`}
      </main>

      <${BottomNav} tabs=${TABS} active=${activeTab} onChange=${setActiveTab} />
    </div>
  `;
}
