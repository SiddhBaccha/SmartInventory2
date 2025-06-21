import React from 'react';
import { X, Package, TrendingUp, RefreshCw, Trash2 } from 'lucide-react';

interface StatsModalProps {
  type: 'items' | 'sold' | 'refill';
  products: Record<string, any>;
  salesData: any[];
  onClose: () => void;
  onClearProductSales?: (productName: string) => void;
  onClearProductRefill?: (productId: string) => void;
}

export function StatsModal({ 
  type, 
  products, 
  salesData, 
  onClose, 
  onClearProductSales,
  onClearProductRefill 
}: StatsModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySales = salesData.filter(sale => sale.date === today);

  const getProductStats = () => {
    if (type === 'items') {
      return Object.entries(products).map(([productId, product]: [string, any]) => ({
        name: product.name,
        value: product.items_left,
        color: 'text-emerald-400',
        productId
      }));
    } else if (type === 'sold') {
      return Object.entries(products).map(([productId, product]: [string, any]) => {
        const sold = todaySales
          .filter(sale => sale.productName === product.name)
          .reduce((sum, sale) => sum + sale.quantity, 0);
        return {
          name: product.name,
          value: sold,
          color: 'text-blue-400',
          productId
        };
      });
    } else { // refill
      return Object.entries(products).map(([productId, product]: [string, any]) => {
        const refillCount = product.refillCount || 0;
        return {
          name: product.name,
          value: refillCount,
          color: 'text-orange-400',
          productId
        };
      });
    }
  };

  const stats = getProductStats();
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);

  const getTitle = () => {
    switch (type) {
      case 'items': return 'Current Inventory';
      case 'sold': return 'Today\'s Sales';
      case 'refill': return 'Items Added to Inventory';
      default: return 'Statistics';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'items': return <Package className="w-6 h-6 text-emerald-400" />;
      case 'sold': return <TrendingUp className="w-6 h-6 text-blue-400" />;
      case 'refill': return <RefreshCw className="w-6 h-6 text-orange-400" />;
      default: return <Package className="w-6 h-6 text-emerald-400" />;
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'items': return 'items';
      case 'sold': return 'sold';
      case 'refill': return 'added';
      default: return 'items';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div 
        className="bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-md border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                type === 'items' ? 'bg-emerald-500/20' : 
                type === 'sold' ? 'bg-blue-500/20' : 'bg-orange-500/20'
              }`}>
                {getIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
                <p className="text-gray-300 text-sm">
                  Total: {total} {getUnit()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-white font-medium">{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                    {type === 'refill' && stat.value > 0 && onClearProductRefill && (
                      <button
                        onClick={() => onClearProductRefill(stat.productId)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        title="Clear individual refill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {type === 'sold' && stat.value > 0 && onClearProductSales && (
                      <button
                        onClick={() => onClearProductSales(stat.name)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        title="Clear individual sales"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stat.color.includes('emerald') ? 'bg-emerald-400' : 
                      stat.color.includes('blue') ? 'bg-blue-400' : 'bg-orange-400'
                    }`}
                    style={{ width: `${total > 0 ? (stat.value / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}