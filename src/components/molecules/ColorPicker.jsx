import { useRef, useEffect, useCallback, useState } from 'react';

export default function ColorPicker({ label, value, onChange }) {
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleSwatchClick = useCallback((e) => {
    e.stopPropagation();
    if (open) {
      inputRef.current?.blur();
      setOpen(false);
    } else {
      inputRef.current?.click();
      setOpen(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [open]);

  return (
    <div className="flex items-center justify-between gap-1.5" ref={wrapRef}>
      <div className="relative flex" onClick={handleSwatchClick}>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="pointer-events-none"
          tabIndex={-1}
        />
      </div>
      {label && (
        <label className="text-[11px] text-text-dim">{label}</label>
      )}
    </div>
  );
}
