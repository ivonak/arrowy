import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TOOLS = [
  { path: '/arrowy', label: 'Arrowy' },
  { path: '/grid', label: 'Grid' },
];

export default function ToolMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="fixed top-4 left-4 z-[100]" style={{ mixBlendMode: 'difference' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex flex-col gap-[3px] p-2 cursor-pointer"
        aria-label="Tool menu"
      >
        <span className="block w-[4px] h-[4px] rounded-full bg-white" />
        <span className="block w-[4px] h-[4px] rounded-full bg-white" />
        <span className="block w-[4px] h-[4px] rounded-full bg-white" />
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.path}
              onClick={() => { navigate(tool.path); setOpen(false); }}
              className={`text-left text-[13px] font-medium cursor-pointer px-2 py-0.5 bg-transparent border-none text-white ${
                location.pathname === tool.path ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              } transition-opacity`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
