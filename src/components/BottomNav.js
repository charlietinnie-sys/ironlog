import { createElement } from 'react';
import htm from 'htm';
const html = htm.bind(createElement);

export default function BottomNav({ tabs, active, onChange }) {
  return html`
    <nav className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur border-t border-border z-20 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        ${tabs.map(tab => html`
          <button
            key=${tab.key}
            onClick=${() => onChange(tab.key)}
            className=${`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors ${
              active === tab.key ? 'text-accent' : 'text-muted'
            }`}
          >
            <span className="text-lg font-display leading-none">${tab.icon}</span>
            <span className="text-[10px] mt-1">${tab.label}</span>
          </button>
        `)}
      </div>
    </nav>
  `;
}
