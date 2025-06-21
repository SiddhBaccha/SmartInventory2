import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertProps {
  message: string;
  isVisible: boolean;
}

export function Alert({ message, isVisible }: AlertProps) {
  if (!isVisible) return null;

  const isSuccess = message.toLowerCase().includes('success');
  const isWarning = message.toLowerCase().includes('low stock');
  const isError = message.toLowerCase().includes('out of stock');

  let bgGradient = 'bg-gradient-to-r from-emerald-500 to-green-500';
  let borderColor = 'border-emerald-300';
  let textColor = 'text-white';
  let icon = <CheckCircle className="w-5 h-5" />;

  if (isError) {
    bgGradient = 'bg-gradient-to-r from-red-500 to-red-600';
    borderColor = 'border-red-300';
    icon = <AlertTriangle className="w-5 h-5" />;
  } else if (isWarning) {
    bgGradient = 'bg-gradient-to-r from-orange-500 to-yellow-500';
    borderColor = 'border-orange-300';
    icon = <AlertTriangle className="w-5 h-5" />;
  }

  return (
    <div className={`mt-4 ${bgGradient} ${textColor} px-6 py-4 rounded-xl shadow-xl transition-all duration-300 animate-fade-in border-2 ${borderColor} backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
}