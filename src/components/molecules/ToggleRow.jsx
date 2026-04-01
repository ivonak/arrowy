import Toggle from '../atoms/Toggle';

export default function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-white/68">{label}</span>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}
