import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let Icon = Info;
        let bg = 'bg-white';
        let border = 'border-primary';
        let text = 'text-primary';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          border = 'border-verified';
          text = 'text-verified';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          border = 'border-failed';
          text = 'text-failed';
        } else if (toast.type === 'warning') {
          Icon = AlertCircle;
          border = 'border-pending';
          text = 'text-pending';
        }

        return (
          <div 
            key={toast.id} 
            className={`flex items-start p-4 ${bg} border-l-4 ${border} rounded shadow-lg animate-in slide-in-from-right-8 fade-in duration-300`}
          >
            <Icon className={`w-5 h-5 ${text} mt-0.5 flex-shrink-0`} />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-text">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-text-muted hover:text-text transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
