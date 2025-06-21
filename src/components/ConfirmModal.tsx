import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  type: 'refill' | 'sales';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ type, onConfirm, onCancel }: ConfirmModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getTitle = () => {
    return type === 'refill' ? 'Clear Refill Data' : 'Clear Sales Data';
  };

  const getMessage = () => {
    return type === 'refill' 
      ? 'Are you sure you want to clear all refill requirements? This action cannot be undone.'
      : 'Are you sure you want to clear all sales data? This action cannot be undone.';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div 
        className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-slate-600 mb-6">{getMessage()}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}