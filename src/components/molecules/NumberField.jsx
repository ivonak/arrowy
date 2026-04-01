import Input from '../atoms/Input';

export default function NumberField({ label, value, onChange, min, max, step, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label className="text-[11px] text-text-dim">{label}</label>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        className="w-[70px] text-center"
      />
    </div>
  );
}
