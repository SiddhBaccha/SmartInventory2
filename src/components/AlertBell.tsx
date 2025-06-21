import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Bell, X, Clock, AlertTriangle, Trash2 } from 'lucide-react';

interface Alert {
  id: string;
  productName: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface AlertBellProps {
  alerts: Alert[];
  onClearAlert: (alertId: string) => void;
  onClearAll: () => void;
}

export function AlertBell({ alerts, onClearAlert, onClearAll }: AlertBellProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const unreadCount = alerts.filter(alert => !alert.read).length;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAlerts(false);
    }
  };

  const alertPortal = document.getElementById('alert-root');

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-full transition-all duration-200 transform hover:scale-110 border border-slate-300"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {showAlerts && alertPortal &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999]"
            onClick={handleBackdropClick}
          >
            <div
              className="fixed top-20 right-4 bg-white rounded-2xl w-96 max-h-[70vh] border border-slate-200 shadow-2xl overflow-hidden z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Bell className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">All Alerts History</h3>
                      <p className="text-slate-600 text-sm">{alerts.length} total alerts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alerts.length > 0 && (
                      <button
                        onClick={onClearAll}
                        className="text-slate-500 hover:text-red-600 transition-colors duration-200 p-1"
                        title="Clear All Alerts"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowAlerts(false)}
                      className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto bg-white">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-800 font-semibold mb-2">All Clear!</p>
                    <p className="text-slate-600 text-sm">No alerts recorded</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-slate-800 text-sm">{alert.productName}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>
                              <p className="text-red-600 text-sm mb-2 font-medium">{alert.message}</p>
                              <button
                                onClick={() => onClearAlert(alert.id)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-800 px-3 py-1 rounded text-xs transition-colors duration-200 font-medium"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          alertPortal
        )}
    </>
  );
}