import { createElement, useState } from 'react';
import htm from 'htm';
const html = htm.bind(createElement);
import { getWorkouts, exportAll } from '../db.js';
import { downloadFile, toCSV } from '../utils.js';

export default function ExportData() {
  const [exported, setExported] = useState(false);
  const workouts = getWorkouts();

  const exportJSON = () => {
    const data = exportAll();
    downloadFile(JSON.stringify(data, null, 2), `ironlog_export_${data.exportDate}.json`, 'application/json');
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const exportCSV = () => {
    if (workouts.length === 0) return;
    const csv = toCSV(workouts);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csv, `ironlog_export_${dateStr}.csv`, 'text/csv;charset=utf-8');
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return html`
    <div>
      <h2 className="text-lg font-semibold mb-4">导出数据</h2>

      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="text-sm text-white mb-2">当前共有 <span className="text-accent font-semibold">${workouts.length}</span> 条训练记录</p>
        <p className="text-xs text-muted">数据存储在本地，换手机或清理浏览器会丢失。建议定期导出备份。</p>
      </div>

      <div className="space-y-3">
        <button
          onClick=${exportJSON}
          className="w-full bg-card border border-border hover:border-accent rounded-xl p-4 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">导出 JSON</h3>
              <p className="text-xs text-muted mt-1">完整数据格式，适合给 Trae 分析</p>
            </div>
            <span className="text-2xl">&#x1F4BE;</span>
          </div>
        </button>

        <button
          onClick=${exportCSV}
          disabled=${workouts.length === 0}
          className="w-full bg-card border border-border hover:border-accent rounded-xl p-4 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">导出 CSV</h3>
              <p className="text-xs text-muted mt-1">表格格式，适合 Excel 查看</p>
            </div>
            <span className="text-2xl">&#x1F4C3;</span>
          </div>
        </button>
      </div>

      ${exported && html`
        <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-xl text-center">
          <span className="text-sm text-accent">导出成功！文件已下载</span>
        </div>
      `}

      <div className="mt-8 p-4 bg-card border border-border rounded-xl">
        <h3 className="text-sm font-semibold text-white mb-2">如何用 Trae 分析？</h3>
        <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
          <li>点击上方「导出 JSON」下载数据文件</li>
          <li>在 Trae 中打开这个 JSON 文件</li>
          <li>告诉 Trae："帮我分析一下我的训练数据"</li>
          <li>Trae 会帮你分析训练容量、进度趋势等</li>
        </ol>
      </div>
    </div>
  `;
}
