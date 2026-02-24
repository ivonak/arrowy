import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const show = useCallback((msg, duration = 1500) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setVisible(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className={`fixed bottom-5 left-1/2 bg-[#1a1c2e] border border-accent-border text-accent px-5 py-2 rounded-lg text-xs font-semibold z-[300] pointer-events-none transition-transform duration-300 ${
          visible ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[60px]'
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
