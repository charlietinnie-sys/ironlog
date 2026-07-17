const CACHE_NAME = 'ironlog-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './src/main.js',
  './src/App.js',
  './src/db.js',
  './src/utils.js',
  './src/components/TodayWorkout.js',
  './src/components/PlanManager.js',
  './src/components/History.js',
  './src/components/ExportData.js',
  './src/components/BottomNav.js',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/react-router-dom@6.24.1',
  'https://esm.sh/htm@3.1.1/react?deps=react@18.3.1',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
