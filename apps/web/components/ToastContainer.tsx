'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`
            min-w-[300px] max-w-md p-4 rounded-lg flex items-center justify-between
            transform transition-all duration-300 ease-in-out
            border-2 font-bold text-base
            shadow-[0_8px_30px_rgba(0,0,0,0.4)]
            ${type === 'success' ? 'bg-[#10B981] border-[#059669] text-white' :
              type === 'error' ? 'bg-[#EF4444] border-[#DC2626] text-white' :
              type === 'warning' ? 'bg-[#F59E0B] border-[#D97706] text-white' :
              'bg-[#3B82F6] border-[#2563EB] text-white'}
          `}
        >
          <div className="flex items-center gap-3">
            {type === 'success' && (
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'error' && (
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-bold text-base leading-snug">{message}</span>
          </div>
          <button
            onClick={() => removeToast(id)}
            className="ml-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
