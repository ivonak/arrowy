import { useCallback, useRef } from 'react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import ResetIcon from '../atoms/icons/ResetIcon';

export default function Slider({ label, value, min, max, step, onChange, unit, defaultValue }) {
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

  const canReset = defaultValue !== undefined && value !== defaultValue;

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-[11px] text-text-dim">{label}</label>
        )}
        <div className="flex items-center gap-1">
          {defaultValue !== undefined && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => canReset && onChange?.(defaultValue)}
              title={canReset ? `Reset to ${defaultValue}` : 'At default'}
              disabled={!canReset}
              tabIndex={-1}
            >
              <ResetIcon />
            </Button>
          )}
          <Input
            ref={numRef}
            type="text"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumber}
            className="w-12 shrink-0"
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
        className="w-full mt-2.5 block"
      />
    </div>
  );
}
