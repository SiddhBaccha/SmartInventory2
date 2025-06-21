import React, { useState } from 'react';
import { ProductCard } from './components/ProductCard';
import { LoginModal } from './components/LoginModal';
import { MenuPanel } from './components/MenuPanel';
import { SalesLog } from './components/SalesLog';
import { AlertBell } from './components/AlertBell';
import { TheftAlert } from './components/TheftAlert';
import { StatsModal } from './components/StatsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { useFirebaseData } from './hooks/useFirebaseData';
import { useAuth } from './hooks/useAuth';
import { useSalesTracking } from './hooks/useSalesTracking';
import { Activity, TrendingUp, AlertTriangle, Menu, Plus, Package, Trash2 } from 'lucide-react';

export default function App() {
  const [showMenu, setShowMenu] = useState(false);
  const [showSalesLog, setShowSalesLog] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState<'items' | 'sold' | 'refill' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<'refill' | 'sales' | null>(null);
  const [theftAlert, setTheftAlert] = useState<{ product: string; message: string } | null>(null);
  const { user, login, logout } = useAuth();

  const {
    products,
    loading,
    updateProductName,
    updateProductWeight,
    updateLowStockThreshold,
    updateTheftThreshold,
    logAlert,
    addProduct,
    deleteProduct,
    alerts,
    clearAlert,
    clearAllAlerts,
    clearRefillData,
    clearProductRefill
  } = useFirebaseData();

  const { 
    salesData, 
    logSale, 
    generateExcelReceipt, 
    totalSoldToday, 
    clearAllSales, 
    clearProductSales,
    trackItemChange 
  } = useSalesTracking();

  // Track item changes for automatic sale detection
  React.useEffect(() => {
    if (!loading && user) {
      Object.values(products).forEach((product: any) => {
        if (product.isOnline) {
          trackItemChange(product.name, product.items_left, product.item_weight);
        }
      });
    }
  }, [Object.values(products).map((p: any) => `${p.items_left}-${p.isOnline}`), loading, user]);

  // Theft detection logic
  React.useEffect(() => {
    if (!loading && user) {
      Object.values(products).forEach((product: any) => {
        if (product.isOnline && product.lastSaleTime) {
          const timeSinceLastSale = Date.now() - product.lastSaleTime;
          const twoMinutes = 2 * 60 * 1000;
          
          if (timeSinceLastSale > twoMinutes && product.items_left < product.previousItemsLeft) {
            setTheftAlert({
              product: product.name,
              message: 'THEFT DETECTED - Unauthorized item removal!'
            });
            
            setTimeout(() => setTheftAlert(null), 6000);
          }
        }
      });
    }
  }, [products, loading, user]);

  // Track alerts when items are low - only for online sensors
  React.useEffect(() => {
    if (!loading && user) {
      Object.values(products).forEach((product: any) => {
        if (product.isOnline) {
          const threshold = product.lowStockThreshold || 2;
          if (product.items_left <= 0) {
            logAlert(product.name, 'Out of Stock - Refill Required!');
          } else if (product.items_left <= threshold) {
            logAlert(product.name, `Low Stock Warning - ${product.items_left} items left`);
          }
        }
      });
    }
  }, [Object.values(products).map((p: any) => `${p.items_left}-${p.isOnline}`), loading, user]);

  const handleClearRefill = () => {
    setShowConfirmModal('refill');
  };

  const handleClearSales = () => {
    setShowConfirmModal('sales');
  };

  const confirmClear = async () => {
    if (showConfirmModal === 'sales') {
      await clearAllSales();
    } else if (showConfirmModal === 'refill') {
      await clearRefillData();
    }
    setShowConfirmModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-700 text-xl font-medium">Loading Smart Inventory System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>
        
        <LoginModal onLogin={login} />
      </div>
    );
  }

  const totalItems = Object.values(products).reduce((sum: number, product: any) => sum + product.items_left, 0);
  const refillItems = Object.values(products).reduce((sum: number, product: any) => sum + (product.refillCount || 0), 0);

  const mostRecentAlert = alerts.length > 0 ? alerts[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-slate-800">
      {/* Enhanced professional animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-20 left-20 w-60 h-60 bg-gradient-to-br from-cyan-200 to-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-300"></div>
      </div>

      {/* Header with glass morphism effect */}
      <header className="relative z-10 p-6 border-b border-white/30 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 shadow-xl">
        <div className="w-full flex justify-between items-center px-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-white/20 to-white/10 p-2 rounded-xl shadow-lg backdrop-blur-sm">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Smart Inventory Management System
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <AlertBell 
              alerts={alerts} 
              onClearAlert={clearAlert}
              onClearAll={clearAllAlerts}
            />
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/90 hover:bg-white text-slate-700 p-3 rounded-xl transition-all duration-200 ml-4 border border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Stats Overview with gradient cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 cursor-pointer hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            onClick={() => setShowStatsModal('refill')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Items Added to Inventory</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{refillItems}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearRefill();
                }}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
          
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 cursor-pointer hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            onClick={() => setShowStatsModal('sold')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Items Sold</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{totalSoldToday}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSales();
                }}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Alerts</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            {mostRecentAlert ? (
              <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-red-800 text-sm font-semibold">{mostRecentAlert.productName}</p>
                  <p className="text-red-600 text-xs font-medium">
                    {new Date(mostRecentAlert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-red-700 text-xs font-medium">{mostRecentAlert.message}</p>
              </div>
            ) : (
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-inner">
                <p className="text-emerald-700 text-sm font-semibold">All systems normal</p>
                <p className="text-emerald-600 text-xs">No active alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Product cards with enhanced styling and alert boxes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {Object.entries(products).map(([productId, product]: [string, any]) => {
            const threshold = product.lowStockThreshold || 2;
            const alertMessage = !product.isOnline ? 'Offline' : 
              product.items_left <= 0 ? 'Out of Stock - Refill Required!' :
              product.items_left <= threshold ? 'Low Stock Warning - Consider Refilling' : 'All Good';
            
            return (
              <ProductCard
                key={productId}
                name={product.name}
                weight={!product.isOnline ? 'N/A' : product.total_weight}
                itemsLeft={!product.isOnline ? 'N/A' : product.items_left}
                itemWeight={product.item_weight}
                isOffline={!product.isOnline}
                lowStockThreshold={threshold}
                alertMessage={alertMessage}
              />
            );
          })}
        </div>

        {/* Enhanced Add Product Button */}
        <button
          onClick={addProduct}
          className="fixed bottom-20 left-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-90"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Enhanced Footer */}
        <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md py-3 text-center text-slate-600 border-t border-white/30 shadow-lg">
          <p className="font-medium">&copy; 2025 Smart Inventory System</p>
        </footer>
      </div>

      {/* Menu Panel */}
      <MenuPanel
        showMenu={showMenu}
        onClose={() => setShowMenu(false)}
        onShowSalesLog={() => {
          setShowSalesLog(true);
          setShowMenu(false);
        }}
        onGenerateReceipt={generateExcelReceipt}
        onLogout={logout}
        products={products}
        onUpdateName={updateProductName}
        onUpdateWeight={updateProductWeight}
        onUpdateThreshold={updateLowStockThreshold}
        onUpdateTheftThreshold={updateTheftThreshold}
        onDeleteProduct={deleteProduct}
      />

      {/* Sales Log Modal */}
      {showSalesLog && (
        <SalesLog
          salesData={salesData}
          onClose={() => setShowSalesLog(false)}
          onGenerateReceipt={generateExcelReceipt}
          products={products}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <StatsModal
          type={showStatsModal}
          products={products}
          salesData={salesData}
          onClose={() => setShowStatsModal(null)}
          onClearProductSales={clearProductSales}
          onClearProductRefill={clearProductRefill}
        />
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <ConfirmModal
          type={showConfirmModal}
          onConfirm={confirmClear}
          onCancel={() => setShowConfirmModal(null)}
        />
      )}

      {/* Theft Alert */}
      {theftAlert && (
        <TheftAlert
          product={theftAlert.product}
          message={theftAlert.message}
          onClose={() => setTheftAlert(null)}
        />
      )}
    </div>
  );
}