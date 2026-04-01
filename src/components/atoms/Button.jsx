const sizeClasses = {
  default: 'h-8 px-3 py-[6px] text-[11px] font-semibold',
  sm: 'h-7 px-2 py-[3px] text-[10px] font-semibold',
  lg: 'h-10 px-4 py-2 text-[12px] font-semibold',
  'icon-xs': 'w-4 h-4 p-0',
  'icon-sm': 'w-5 h-5 p-0',
  'icon-md': 'w-[26px] h-[26px] p-0',
};

const variantClasses = {
  default: 'bg-surface border border-panel-border text-white/70 hover:bg-surface-active hover:text-white',
  primary: 'bg-accent-bg border border-accent-border text-accent hover:bg-accent-dim',
  ghost: 'bg-transparent border-none text-white/40 hover:text-white/70 hover:bg-white/8',
  overlay: 'bg-black/60 border-none text-white/60 opacity-0 group-hover:opacity-100 transition-opacity',
  subtle: 'bg-surface border border-white/18 text-white/86 hover:bg-surface-active hover:text-white',
};

export default function Button({ children, onClick, variant = 'default', size = 'default', disabled, title, className = '', ...rest }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center rounded-md cursor-pointer transition-all duration-150 select-none shrink-0 ${
        sizeClasses[size] || sizeClasses.default
      } ${
        disabled ? 'text-white/10 cursor-default hover:bg-transparent' : (variantClasses[variant] || variantClasses.default)
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
