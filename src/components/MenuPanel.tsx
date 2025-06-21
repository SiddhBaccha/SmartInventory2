import React, { useState, useEffect } from 'react';
import { Download, BarChart3, X, Settings, LogOut, Trash2, AlertTriangle, Shield } from 'lucide-react';

interface MenuPanelProps {
  showMenu: boolean;
  onClose: () => void;
  onShowSalesLog: () => void;
  onGenerateReceipt: (type: 'daily' | 'weekly' | 'monthly') => void;
  onLogout: () => void;
  products: Record<string, any>;
  onUpdateName: (productId: string, name: string) => Promise<void>;
  onUpdateWeight: (productId: string, weight: number) => Promise<void>;
  onUpdateThreshold: (productId: string, threshold: number) => Promise<void>;
  onUpdateTheftThreshold: (productId: string, threshold: number) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

export function MenuPanel({ 
  showMenu, 
  onClose, 
  onShowSalesLog, 
  onGenerateReceipt, 
  onLogout,
  products,
  onUpdateName,
  onUpdateWeight,
  onUpdateThreshold,
  onUpdateTheftThreshold,
  onDeleteProduct
}: MenuPanelProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [showTheftThresholds, setShowTheftThresholds] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize editing values when products change - but preserve user input
  useEffect(() => {
    const newEditingValues: Record<string, any> = {};
    
    Object.entries(products).forEach(([productId, product]) => {
      // Only set if not already being edited
      if (!editingValues[`name_${productId}`]) {
        newEditingValues[`name_${productId}`] = product.name || '';
      }
      if (!editingValues[`weight_${productId}`]) {
        newEditingValues[`weight_${productId}`] = String(product.item_weight || '');
      }
      if (!editingValues[`threshold_${productId}`]) {
        newEditingValues[`threshold_${productId}`] = String(product.lowStockThreshold || '');
      }
      if (!editingValues[`theftThreshold_${productId}`]) {
        newEditingValues[`theftThreshold_${productId}`] = String(product.theftThreshold || '');
      }
    });
    
    // Only update if we have new values to set
    if (Object.keys(newEditingValues).length > 0) {
      setEditingValues(prev => ({ ...prev, ...newEditingValues }));
    }
  }, [products]);

  const handleInputChange = (key: string, value: string) => {
    setEditingValues(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setMessage('');
      
      // Validate all inputs first
      for (const [productId] of Object.entries(products)) {
        const name = editingValues[`name_${productId}`]?.trim() || '';
        const weightStr = editingValues[`weight_${productId}`]?.trim() || '';
        const weight = parseFloat(weightStr);
        
        if (name === '') {
          throw new Error(`Product name cannot be empty for ${productId}`);
        }
        if (!weightStr || isNaN(weight) || weight <= 0) {
          throw new Error(`Item weight must be a valid number greater than 0 for ${productId}`);
        }
      }
      
      // Update all products
      const updatePromises = Object.entries(products).map(async ([productId]) => {
        const name = editingValues[`name_${productId}`].trim();
        const weight = parseFloat(editingValues[`weight_${productId}`]);
        
        await Promise.all([
          onUpdateName(productId, name),
          onUpdateWeight(productId, weight)
        ]);
      });
      
      await Promise.all(updatePromises);
      
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Update error:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdUpdate = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setMessage('');
      
      // Validate all threshold inputs first
      for (const [productId] of Object.entries(products)) {
        const thresholdStr = editingValues[`threshold_${productId}`]?.trim() || '';
        const threshold = parseInt(thresholdStr);
        
        if (!thresholdStr || isNaN(threshold) || threshold < 0) {
          throw new Error(`Threshold must be a valid number >= 0 for ${productId}`);
        }
      }
      
      // Update all thresholds
      const updatePromises = Object.entries(products).map(async ([productId]) => {
        const threshold = parseInt(editingValues[`threshold_${productId}`]);
        await onUpdateThreshold(productId, threshold);
      });
      
      await Promise.all(updatePromises);
      
      setMessage('Thresholds updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Threshold update error:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleTheftThresholdUpdate = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setMessage('');
      
      // Validate all theft threshold inputs first
      for (const [productId] of Object.entries(products)) {
        const thresholdStr = editingValues[`theftThreshold_${productId}`]?.trim() || '';
        const threshold = parseFloat(thresholdStr);
        
        if (!thresholdStr || isNaN(threshold) || threshold < 0) {
          throw new Error(`Theft threshold must be a valid number >= 0 for ${productId}`);
        }
      }
      
      // Update all theft thresholds
      const updatePromises = Object.entries(products).map(async ([productId]) => {
        const threshold = parseFloat(editingValues[`theftThreshold_${productId}`]);
        await onUpdateTheftThreshold(productId, threshold);
      });
      
      await Promise.all(updatePromises);
      
      setMessage('Theft thresholds updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Theft threshold update error:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async (productId: string) => {
    if (Object.keys(products).length <= 2) {
      setMessage('Cannot delete - minimum 2 products required');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await onDeleteProduct(productId);
      setMessage('Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      setShowDeleteConfirm(null);
    } catch (error) {
      setMessage('Error deleting product. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setShowSettings(false);
      setShowThresholds(false);
      setShowTheftThresholds(false);
      setShowDeleteOptions(false);
      setShowDeleteConfirm(null);
    }
  };

  if (!showMenu) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150]" onClick={handleBackdropClick}>
      <div 
        className="fixed top-16 right-4 bg-white rounded-xl p-6 w-80 border border-slate-200 shadow-2xl max-h-[80vh] overflow-y-auto z-[151]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Menu</h3>
          <button
            onClick={() => {
              onClose();
              setShowSettings(false);
              setShowThresholds(false);
              setShowTheftThresholds(false);
              setShowDeleteOptions(false);
              setShowDeleteConfirm(null);
            }}
            className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={onShowSalesLog}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 p-4 rounded-lg flex items-center gap-3 transition-all duration-200 hover:transform hover:scale-105 border border-slate-200"
          >
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <div className="text-left">
              <div className="font-semibold">View Sales Log</div>
              <div className="text-sm text-slate-600">Track daily sales data</div>
            </div>
          </button>

          <div className="border-t border-slate-200 pt-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 p-4 rounded-lg flex items-center gap-3 transition-all duration-200 hover:transform hover:scale-105 border border-slate-200"
            >
              <Settings className="w-5 h-5 text-slate-600" />
              <div className="text-left">
                <div className="font-semibold">Settings</div>
                <div className="text-sm text-slate-600">Configure products</div>
              </div>
            </button>

            {showSettings && (
              <div className="mt-4 bg-slate-50 rounded-lg p-4 space-y-4 max-h-64 overflow-y-auto border border-slate-200">
                {Object.entries(products).map(([productId, product]) => (
                  <div key={productId} className="border-b border-slate-200 pb-4 last:border-b-0">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">{product.name} Settings</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1 font-medium">Name</label>
                        <input
                          type="text"
                          value={editingValues[`name_${productId}`] || ''}
                          onChange={(e) => handleInputChange(`name_${productId}`, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1 font-medium">Item Weight (g)</label>
                        <input
                          type="text"
                          value={editingValues[`weight_${productId}`] || ''}
                          onChange={(e) => handleInputChange(`weight_${productId}`, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter item weight"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors duration-200 text-sm font-medium shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Settings'
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowThresholds(!showThresholds)}
              className="w-full bg-yellow-50 hover:bg-yellow-100 text-slate-800 p-4 rounded-lg flex items-center gap-3 transition-all duration-200 hover:transform hover:scale-105 mt-3 border border-yellow-200"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="text-left">
                <div className="font-semibold">Low Stock Thresholds</div>
                <div className="text-sm text-slate-600">Set alert thresholds</div>
              </div>
            </button>

            {showThresholds && (
              <div className="mt-4 bg-yellow-50 rounded-lg p-4 space-y-4 border border-yellow-200">
                {Object.entries(products).map(([productId, product]) => (
                  <div key={productId} className="border-b border-yellow-200 pb-3 last:border-b-0">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">{product.name} Threshold</label>
                    <input
                      type="text"
                      value={editingValues[`threshold_${productId}`] || ''}
                      onChange={(e) => handleInputChange(`threshold_${productId}`, e.target.value)}
                      className="w-full bg-white border border-yellow-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter threshold"
                    />
                  </div>
                ))}

                <button
                  onClick={handleThresholdUpdate}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors duration-200 text-sm font-medium shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Thresholds'
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowTheftThresholds(!showTheftThresholds)}
              className="w-full bg-red-50 hover:bg-red-100 text-slate-800 p-4 rounded-lg flex items-center gap-3 transition-all duration-200 hover:transform hover:scale-105 mt-3 border border-red-200"
            >
              <Shield className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-semibold">Theft Thresholds</div>
                <div className="text-sm text-slate-600">Set theft detection limits</div>
              </div>
            </button>

            {showTheftThresholds && (
              <div className="mt-4 bg-red-50 rounded-lg p-4 space-y-4 border border-red-200">
                {Object.entries(products).map(([productId, product]) => (
                  <div key={productId} className="border-b border-red-200 pb-3 last:border-b-0">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">{product.name} Theft Threshold (g)</label>
                    <input
                      type="text"
                      value={editingValues[`theftThreshold_${productId}`] || ''}
                      onChange={(e) => handleInputChange(`theftThreshold_${productId}`, e.target.value)}
                      className="w-full bg-white border border-red-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter theft threshold"
                    />
                  </div>
                ))}

                <button
                  onClick={handleTheftThresholdUpdate}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors duration-200 text-sm font-medium shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Theft Thresholds'
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowDeleteOptions(!showDeleteOptions)}
              className="w-full bg-red-50 hover:bg-red-100 text-slate-800 p-4 rounded-lg flex items-center gap-3 transition-all duration-200 hover:transform hover:scale-105 mt-3 border border-red-200"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-semibold">Delete Products</div>
                <div className="text-sm text-slate-600">Remove smart scales</div>
              </div>
            </button>

            {showDeleteOptions && (
              <div className="mt-4 bg-red-50 rounded-lg p-4 space-y-2 border border-red-200">
                <p className="text-xs text-red-700 mb-3 font-medium">Select products to delete:</p>
                {Object.entries(products).map(([productId, product]) => (
                  <button
                    key={productId}
                    onClick={() => setShowDeleteConfirm(productId)}
                    className="w-full bg-red-100 hover:bg-red-200 text-slate-800 p-2 rounded text-sm transition-colors duration-200 border border-red-300"
                  >
                    Delete {product.name}
                  </button>
                ))}
              </div>
            )}

            {showDeleteConfirm && (
              <div className="mt-4 bg-red-100 rounded-lg p-4 border border-red-300">
                <p className="text-slate-800 text-sm mb-3 font-medium">
                  Are you sure you want to delete {products[showDeleteConfirm]?.name}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition-colors duration-200 font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-2 rounded text-sm transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-slate-800 p-4 rounded-lg flex items-center gap-3 transition-all duration-200 hover:transform hover:scale-105 mt-3 border border-red-200"
            >
              <LogOut className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-semibold">Logout</div>
                <div className="text-sm text-slate-600">Sign out of system</div>
              </div>
            </button>
          </div>

          {message && (
            <div className={`text-center p-3 rounded-lg text-sm font-medium animate-fade-in ${
              message.includes('Error') || message.includes('Cannot') 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}