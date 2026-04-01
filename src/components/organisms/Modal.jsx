import { useEffect, useCallback, useRef, useState } from 'react';
import Button from '../atoms/Button';
import CloseIcon from '../atoms/icons/CloseIcon';
import CopyIcon from '../atoms/icons/CopyIcon';
import Tabs from '../molecules/Tabs';

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
          <Button variant="ghost" size="icon-md" onClick={onClose} title="Close">
            <CloseIcon className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CodeModal({ open, onClose, title, readableCode, minifiedCode, instructions, demoHtml }) {
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

  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const openDemo = useCallback(() => {
    if (!demoHtml) return;
    const html = typeof demoHtml === 'function' ? demoHtml() : demoHtml;
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  }, [demoHtml]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {instructions && (
        <div className="mb-4 text-[13px] leading-relaxed text-white/70">
          {instructions}
        </div>
      )}
      <div className="border border-white/6 rounded-lg overflow-hidden mb-4 bg-[#0d0f1a]">
        <div className="flex items-center justify-between px-3 py-2">
          <Tabs tabs={[{ id: 'readable', label: 'Readable JS' }, { id: 'minified', label: 'Minified JS' }]} activeTab={mode} onChange={setMode} />
          <div className="flex items-center gap-1.5">
            {copied && <span className="text-[11px] text-accent">Copied!</span>}
            <Button variant="ghost" size="icon-md" onClick={copyCode} title="Copy code">
              <CopyIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <pre className="px-4 py-4 overflow-auto font-mono text-xs leading-relaxed text-[#c9d1d9] whitespace-pre max-h-[30vh]">
          {loading ? 'Generating minified code...' : code}
        </pre>
      </div>
      {demoHtml && (
        <Button variant="subtle" onClick={openDemo} className="w-full">
          Open Demo Page
        </Button>
      )}
    </Modal>
  );
}
