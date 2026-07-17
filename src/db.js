const DB_KEY = 'ironlog_data';

function getData() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : { workouts: [], plans: [], dayMeta: {} };
  } catch {
    return { workouts: [], plans: [], dayMeta: {} };
  }
}

function saveData(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

export function getWorkouts() {
  return getData().workouts || [];
}

export function addWorkout(item) {
  const data = getData();
  data.workouts.unshift(item);
  saveData(data);
  return item;
}

export function deleteWorkout(id) {
  const data = getData();
  data.workouts = data.workouts.filter(w => w.id !== id);
  saveData(data);
}

export function updateWorkout(item) {
  const data = getData();
  const idx = data.workouts.findIndex(w => w.id === item.id);
  if (idx >= 0) {
    data.workouts[idx] = item;
    saveData(data);
  }
  return item;
}

export function getWorkoutsByDate(dateStr) {
  return getWorkouts().filter(w => w.date === dateStr);
}

export function getWorkoutDates() {
  const dates = new Set(getWorkouts().map(w => w.date));
  return Array.from(dates).sort();
}

export function getDayMeta(dateStr) {
  return getData().dayMeta?.[dateStr] || {};
}

export function setDayMeta(dateStr, meta) {
  const data = getData();
  if (!data.dayMeta) data.dayMeta = {};
  data.dayMeta[dateStr] = { ...data.dayMeta[dateStr], ...meta };
  saveData(data);
}

export function getPlans() {
  return getData().plans || [];
}

export function addPlan(plan) {
  const data = getData();
  data.plans.push(plan);
  saveData(data);
  return plan;
}

export function updatePlan(plan) {
  const data = getData();
  const idx = data.plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) {
    data.plans[idx] = plan;
    saveData(data);
  }
}

export function deletePlan(id) {
  const data = getData();
  data.plans = data.plans.filter(p => p.id !== id);
  saveData(data);
}

export function exportAll() {
  const data = getData();
  return {
    exportDate: new Date().toISOString().split('T')[0],
    appVersion: '1.0.0',
    workouts: data.workouts,
    plans: data.plans,
    dayMeta: data.dayMeta || {}
  };
}