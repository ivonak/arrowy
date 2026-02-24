import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'panel_collapsed';

export function usePanelCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed(c => !c), []);

  return [collapsed, toggle];
}

export const PANEL_WIDTH = 318;

export default function Panel({ title, subtitle, children, footer, collapsed, onToggleCollapsed }) {
  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapsed}
        className="fixed top-3 right-3 z-[100] w-8 h-8 flex items-center justify-center rounded-lg bg-panel/80 backdrop-blur-md border border-panel-border text-text-dim hover:text-white cursor-pointer transition-colors"
        aria-label="Expand panel"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 3L5 7L9 11" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 w-[318px] h-screen bg-panel backdrop-blur-[10px] border-l border-panel-border z-[100] flex flex-col overflow-hidden">
      <div className="px-3.5 pt-3 pb-2.5 border-b border-panel-border shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-sm font-bold text-white mb-0.5">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-text-muted">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onToggleCollapsed}
          className="mt-0.5 w-6 h-6 flex items-center justify-center rounded text-text-dim hover:text-white cursor-pointer transition-colors shrink-0"
          aria-label="Collapse panel"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 3L9 7L5 11" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-[70px]">
        {children}
      </div>
      {footer && (
        <div className="absolute bottom-0 left-0 right-0 px-3.5 py-2 bg-panel-solid/95 border-t border-white/8 z-[101]">
          {footer}
        </div>
      )}
    </div>
  );
}
