export default function Select({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between mb-[6px]">
      {label && (
        <label className="text-[11px] text-text-dim">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-7 rounded-md border border-panel-border bg-surface text-white/85 text-[11px] px-2 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
