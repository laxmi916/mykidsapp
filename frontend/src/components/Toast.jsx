import { useState, createContext, useContext } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, duration = 2500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: '30px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center',
      }}>
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}