import { useCallback } from 'react';

export default function Toggle({ value, onChange }) {
  const handleClick = useCallback(() => {
    onChange?.(!value);
  }, [value, onChange]);

  return (
    <div
      onClick={handleClick}
      className={`relative w-[22px] h-[12px] rounded-full border cursor-pointer transition-all duration-200 flex-shrink-0 ${
        value
          ? 'bg-accent-dim border-accent-border'
          : 'bg-text-faint border-panel-border'
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-[10px] h-[10px] rounded-full bg-white/70 transition-transform duration-200 ${
          value ? 'translate-x-[10px]' : ''
        }`}
      />
    </div>
  );
}
