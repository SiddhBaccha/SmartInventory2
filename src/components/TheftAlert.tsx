import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

interface TheftAlertProps {
  product: string;
  message: string;
  onClose: () => void;
}

export function TheftAlert({ product, message, onClose }: TheftAlertProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center">
      <div className="bg-red-900/95 backdrop-blur-md rounded-2xl p-8 border-2 border-red-500 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="bg-red-500/30 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse">
            <Shield className="w-10 h-10 text-red-300" />
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-red-300 mb-2 animate-pulse">
              🚨 SECURITY ALERT 🚨
            </h2>
            <p className="text-xl font-semibold text-white mb-2">{product}</p>
            <p className="text-red-200 font-bold text-lg animate-pulse">
              {message}
            </p>
          </div>

          <div className="bg-red-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-semibold">IMMEDIATE ACTION REQUIRED</span>
            </div>
            <p className="text-red-200 text-sm">
              Unauthorized item removal detected. Please verify inventory immediately.
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Acknowledge Alert
          </button>
        </div>
      </div>
    </div>
  );
}