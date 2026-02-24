import { useEffect, useCallback, useRef, useState } from 'react';
import Button from './Button';

export default function Modal({ open, onClose, title, children }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === backdropRef.current) onClose?.();
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center"
    >
      <div className="bg-[#1a1c2e] border border-white/10 rounded-xl w-[90vw] max-w-[800px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-[15px] text-white font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-white/40 text-xl cursor-pointer px-2 py-1 rounded hover:text-white hover:bg-white/8"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CodeModal({ open, onClose, title, readableCode, minifiedCode }) {
  const [mode, setMode] = useState('readable');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'readable') {
      setCode(readableCode || '');
      setLoading(false);
    } else {
      setLoading(true);
      if (minifiedCode) {
        minifiedCode().then((c) => {
          setCode(c);
          setLoading(false);
        });
      }
    }
  }, [open, mode, readableCode, minifiedCode]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="border border-white/6 rounded-lg overflow-hidden mb-4 bg-[#0d0f1a]">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMode('readable')}
              className={`px-[1px] py-[3px] text-[11px] border-none bg-transparent cursor-pointer relative ${
                mode === 'readable' ? 'text-white font-medium' : 'text-white/65'
              }`}
            >
              Readable JS
              {mode === 'readable' && (
                <span className="absolute left-0 right-0 -bottom-[3px] h-[1px] rounded bg-accent" />
              )}
            </button>
            <button
              onClick={() => setMode('minified')}
              className={`px-[1px] py-[3px] text-[11px] border-none bg-transparent cursor-pointer relative ${
                mode === 'minified' ? 'text-white font-medium' : 'text-white/65'
              }`}
            >
              Minified JS
              {mode === 'minified' && (
                <span className="absolute left-0 right-0 -bottom-[3px] h-[1px] rounded bg-accent" />
              )}
            </button>
          </div>
          <button
            onClick={copyCode}
            className="w-[26px] h-[26px] rounded-md border-none bg-transparent text-white/70 cursor-pointer grid place-items-center hover:bg-white/8 hover:text-white"
            title="Copy code"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          </button>
        </div>
        <pre className="px-4 py-4 overflow-auto font-mono text-xs leading-relaxed text-[#c9d1d9] whitespace-pre max-h-[30vh]">
          {loading ? 'Generating minified code...' : code}
        </pre>
      </div>
    </Modal>
  );
}
