import { useState, useCallback } from 'react';
import Toggle from './Toggle';

export default function Section({ title, defaultOpen = true, toggle, toggleValue, onToggleChange, children }) {
  const [open, setOpen] = useState(defaultOpen);

  const handleHeaderClick = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  return (
    <div className="border-b border-white/5">
      <div
        onClick={handleHeaderClick}
        className="flex items-center justify-between px-3.5 py-2 cursor-pointer select-none transition-colors duration-150 hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
            {title}
          </span>
          {toggle && (
            <div onClick={(e) => e.stopPropagation()}>
              <Toggle value={toggleValue} onChange={onToggleChange} />
            </div>
          )}
        </div>
        <span
          className={`text-[10px] text-white/30 transition-transform duration-200 ${
            open ? '' : '-rotate-90'
          }`}
        >
          ▾
        </span>
      </div>
      {open && (
        <div className="px-3.5 pb-2.5">
          {children}
        </div>
      )}
    </div>
  );
}
