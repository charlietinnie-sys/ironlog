export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function toCSV(workouts) {
  const header = '日期,动作,器械,重量,单位,组数,次数,备注';
  const rows = workouts.map(w =>
    `${w.date},${w.exercise},${w.equipment},${w.weight},${w.weightUnit || 'kg'},${w.sets},${w.reps},${w.note || ''}`
  );
  return [header, ...rows].join('\n');
}

export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startPadding = firstDay.getDay();
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      day: i,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }
  return days;
}

export function getMonthYearStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const PLAN_COLORS = [
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-red-500',
];

export const COMMON_EXERCISES = [
  '深蹲', '硬拉', '臀推', '腿举', '腿屈伸', '腿弯举', '罗马尼亚硬拉',
  '杠铃卧推', '哑铃卧推', '上斜卧推', '龙门架夹胸', '俯卧撑', '双杠臂屈伸',
  '引体向上', '高位下拉', '杠铃划船', '单臂哑铃划船', '坐姿划船', '直臂下压',
  '推举', '哑铃侧平举', '面拉', '前平举', '俯身飞鸟',
  '杠铃弯举', '锤式弯举', '三头下压', '窄距卧推', '集中弯举',
  '卷腹', '平板支撑', '俄罗斯转体', '悬垂举腿', '仰卧抬腿'
];