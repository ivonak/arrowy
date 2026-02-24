export default function Button({ label, onClick, variant = 'default', className = '' }) {
  const base = 'px-3 py-[6px] text-[11px] font-semibold border rounded-md cursor-pointer transition-all duration-150';
  const variants = {
    default: 'bg-surface border-panel-border text-white/70 hover:bg-surface-active hover:text-white',
    primary: 'bg-accent-bg border-accent-border text-accent hover:bg-accent-dim',
    small: 'px-[7px] py-[3px] text-[10px] bg-surface border-panel-border text-white/70 hover:bg-surface-active hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.default} ${className}`}
    >
      {label}
    </button>
  );
}
