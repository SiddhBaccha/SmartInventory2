import React, { useState } from 'react';
import { X, Download, Calendar, Package } from 'lucide-react';

interface Sale {
  id: string;
  productName: string;
  quantity: number;
  itemWeight: number;
  timestamp: number;
  date: string;
  time: string;
}

interface SalesLogProps {
  salesData: Sale[];
  onClose: () => void;
  onGenerateReceipt: (type: 'daily' | 'weekly' | 'monthly') => void;
  products: Record<string, any>;
}

export function SalesLog({ salesData, onClose, onGenerateReceipt, products }: SalesLogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredSales = salesData.filter(sale => sale.date === selectedDate);

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  // Calculate sales per product
  const productSales = Object.values(products).reduce((acc: Record<string, number>, product: any) => {
    acc[product.name] = filteredSales
      .filter(sale => sale.productName === product.name)
      .reduce((sum, sale) => sum + sale.quantity, 0);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sales Data Log</h2>
                <p className="text-gray-300">Track your daily sales performance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">Select Date</p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-white border-none outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-gray-300">Total Items Sold</p>
                  <p className="text-xl font-bold text-white">{totalSales}</p>
                </div>
              </div>
            </div>

            {Object.entries(productSales).slice(0, 2).map(([productName, sales]) => (
              <div key={productName} className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-300">{productName} Sold</p>
                    <p className="text-xl font-bold text-white">{sales}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional product sales if more than 2 products */}
          {Object.keys(productSales).length > 2 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(productSales).slice(2).map(([productName, sales]) => (
                <div key={productName} className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-300">{productName}</p>
                      <p className="text-lg font-bold text-white">{sales}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Sales for {selectedDate}</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredSales.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No sales recorded for this date</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredSales.map((sale) => (
                    <div key={sale.id} className="p-4 hover:bg-white/5 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <Package className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{sale.productName}</p>
                            <p className="text-sm text-gray-300">
                              {sale.quantity} items × {sale.itemWeight}g each
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{sale.quantity} items</p>
                          <p className="text-sm text-gray-300">{sale.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onGenerateReceipt('daily')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Daily Excel</span>
            </button>
            <button
              onClick={() => onGenerateReceipt('weekly')}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Weekly Excel</span>
            </button>
            <button
              onClick={() => onGenerateReceipt('monthly')}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Monthly Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}