import { forwardRef } from 'react';

const Input = forwardRef(function Input({ type = 'text', value, onChange, className = '', ...rest }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      className={`bg-surface border border-panel-border rounded text-text text-[11px] px-1.5 py-px outline-none focus:border-accent-border ${className}`}
      {...rest}
    />
  );
});

export default Input;
