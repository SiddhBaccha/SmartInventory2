import React from 'react';
import { Package, Scale, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProductCardProps {
  name: string;
  weight: number | string;
  itemsLeft: number | string;
  itemWeight: number;
  isOffline: boolean;
  lowStockThreshold: number;
  alertMessage: string;
}

export function ProductCard({ 
  name, 
  weight, 
  itemsLeft, 
  itemWeight, 
  isOffline,
  lowStockThreshold,
  alertMessage
}: ProductCardProps) {
  const isLowStock = !isOffline && typeof itemsLeft === 'number' && itemsLeft <= lowStockThreshold && itemsLeft > 0;
  const isOutOfStock = !isOffline && typeof itemsLeft === 'number' && itemsLeft <= 0;

  // Determine card background color based on stock status
  const getCardBackground = () => {
    if (isOffline) {
      return 'bg-gradient-to-br from-gray-100/90 to-gray-200/90 border-gray-300 hover:from-gray-200 hover:to-gray-300';
    } else if (isOutOfStock) {
      return 'bg-gradient-to-br from-red-100/90 to-red-200/90 border-red-300 hover:from-red-200 hover:to-red-300';
    } else if (isLowStock) {
      return 'bg-gradient-to-br from-orange-100/90 to-orange-200/90 border-orange-300 hover:from-orange-200 hover:to-orange-300';
    } else {
      return 'bg-gradient-to-br from-white/90 to-blue-50/90 border-blue-200 hover:from-white hover:to-blue-100';
    }
  };

  // Determine icon colors
  const getIconColors = () => {
    if (isOffline) {
      return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700';
    } else if (isOutOfStock) {
      return 'bg-gradient-to-br from-red-200 to-red-300 text-red-700';
    } else if (isLowStock) {
      return 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-700';
    } else {
      return 'bg-gradient-to-br from-emerald-200 to-blue-300 text-emerald-700';
    }
  };

  // Get alert box styling and content
  const getAlertBox = () => {
    if (isOffline) {
      return {
        show: true,
        bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
        border: 'border-gray-300',
        text: 'text-gray-700',
        icon: <WifiOff className="w-4 h-4" />,
        message: 'Device Offline'
      };
    } else if (isOutOfStock) {
      return {
        show: true,
        bg: 'bg-gradient-to-r from-red-100 to-red-200',
        border: 'border-red-300',
        text: 'text-red-700',
        icon: <AlertTriangle className="w-4 h-4" />,
        message: 'Out of Stock - Refill Required!'
      };
    } else if (isLowStock) {
      return {
        show: true,
        bg: 'bg-gradient-to-r from-orange-100 to-orange-200',
        border: 'border-orange-300',
        text: 'text-orange-700',
        icon: <AlertTriangle className="w-4 h-4" />,
        message: `Low Stock - ${itemsLeft} items left`
      };
    } else {
      return {
        show: true,
        bg: 'bg-gradient-to-r from-emerald-100 to-emerald-200',
        border: 'border-emerald-300',
        text: 'text-emerald-700',
        icon: <CheckCircle className="w-4 h-4" />,
        message: 'Stock Level Normal'
      };
    }
  };

  const alertBox = getAlertBox();

  return (
    <div className="space-y-4">
      {/* Product Card */}
      <div className={`
        backdrop-blur-md rounded-2xl p-8 shadow-2xl 
        transition-all duration-300 
        hover:transform hover:scale-105
        relative
        border-2
        ${getCardBackground()}
      `}>
        {/* Online/Offline Status */}
        <div className="absolute top-2 right-4">
          {isOffline ? (
            <div className="flex items-center gap-2 bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse shadow-lg">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </div>
          )}
        </div>

        {/* Product icon and name */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-4 rounded-2xl shadow-lg ${getIconColors()}`}>
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
            <p className="text-slate-600 text-sm font-medium">Smart Scale Device</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-1 rounded-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-600 text-sm font-semibold">Total Weight</span>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isOffline ? 'N/A' : `${weight} g`}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-1 rounded-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-600 text-sm font-semibold">Items Left</span>
            </div>
            <p className={`text-xl font-bold ${
              isOutOfStock ? 'text-red-600' : 
              isLowStock ? 'text-orange-600' : 
              'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'
            }`}>
              {isOffline ? 'N/A' : itemsLeft}
            </p>
          </div>
        </div>

        {/* Item weight info */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold">Item Weight:</span>
            <span className="text-slate-800 font-bold text-lg">{itemWeight} g</span>
          </div>
        </div>
      </div>

      {/* Alert Box */}
      {alertBox.show && (
        <div className={`
          ${alertBox.bg} ${alertBox.border} ${alertBox.text}
          rounded-xl p-4 border-2 shadow-lg backdrop-blur-sm
          transition-all duration-300 animate-fade-in
        `}>
          <div className="flex items-center gap-3">
            {alertBox.icon}
            <span className="font-semibold text-sm">{alertBox.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}