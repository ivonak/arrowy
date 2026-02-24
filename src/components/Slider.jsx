import { useCallback, useRef } from 'react';

export default function Slider({ label, value, min, max, step, onChange, unit }) {
  const numRef = useRef(null);

  const handleRange = useCallback((e) => {
    onChange?.(parseFloat(e.target.value));
  }, [onChange]);

  const handleNumber = useCallback((e) => {
    const v = parseFloat(e.target.value);
    if (Number.isFinite(v)) {
      const clamped = Math.min(max, Math.max(min, v));
      onChange?.(clamped);
    }
  }, [onChange, min, max]);

  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-[2px]">
        {label && (
          <label className="text-[11px] text-text-dim">{label}</label>
        )}
        <div className="flex items-center gap-1">
          <input
            ref={numRef}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumber}
            className="w-[52px] bg-surface border border-panel-border rounded text-text text-[11px] px-[5px] py-[3px] text-center shrink-0 outline-none focus:border-accent-border"
          />
          {unit && (
            <span className="text-[10px] text-text-muted shrink-0">{unit}</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleRange}
        className="w-full"
      />
    </div>
  );
}
