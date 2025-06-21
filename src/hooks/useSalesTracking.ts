import { useState, useEffect } from 'react';
import { ref, push, onValue, remove } from 'firebase/database';
import { db } from '../config/firebase';
import * as XLSX from 'xlsx';

interface Sale {
  id: string;
  productName: string;
  quantity: number;
  itemWeight: number;
  timestamp: number;
  date: string;
  time: string;
}

const SALE_DETECTION_DELAY = 2 * 60 * 1000; // 2 minutes

export function useSalesTracking() {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [lastItemCounts, setLastItemCounts] = useState<Record<string, number>>({});
  const [pendingSales, setPendingSales] = useState<Record<string, NodeJS.Timeout>>({});
  const [saleDetectionData, setSaleDetectionData] = useState<Record<string, { 
    originalCount: number; 
    reducedCount: number; 
    itemsReduced: number; 
    timestamp: number;
    itemWeight: number;
  }>>({});

  useEffect(() => {
    const salesRef = ref(db, 'inventory/sales');
    
    const unsubscribe = onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const salesArray = Object.entries(data).map(([id, sale]: [string, any]) => ({
          id,
          ...sale
        }));
        setSalesData(salesArray.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setSalesData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const trackItemChange = (productName: string, currentItems: number, itemWeight: number) => {
    const lastCount = lastItemCounts[productName];
    
    // Initialize if first time tracking this product
    if (lastCount === undefined) {
      setLastItemCounts(prev => ({ ...prev, [productName]: currentItems }));
      return;
    }
    
    // Only track if items have decreased (potential sale)
    if (lastCount > currentItems) {
      const itemsReduced = lastCount - currentItems;
      const now = Date.now();
      
      console.log(`Potential sale detected for ${productName}: ${itemsReduced} items reduced`);
      
      // Clear any existing pending sale for this product
      if (pendingSales[productName]) {
        clearTimeout(pendingSales[productName]);
      }
      
      // Store sale detection data
      setSaleDetectionData(prev => ({
        ...prev,
        [productName]: {
          originalCount: lastCount,
          reducedCount: currentItems,
          itemsReduced,
          timestamp: now,
          itemWeight
        }
      }));
      
      // Set a timer to confirm sale after 2 minutes
      const timeoutId = setTimeout(() => {
        const detectionData = saleDetectionData[productName];
        if (detectionData && detectionData.timestamp === now) {
          // Confirm the sale
          logSale(productName, detectionData.itemsReduced, detectionData.itemWeight);
          console.log(`Sale confirmed for ${productName}: ${detectionData.itemsReduced} items sold`);
        }
        
        // Clean up
        setPendingSales(prev => {
          const newPending = { ...prev };
          delete newPending[productName];
          return newPending;
        });
        
        setSaleDetectionData(prev => {
          const newData = { ...prev };
          delete newData[productName];
          return newData;
        });
      }, SALE_DETECTION_DELAY);
      
      setPendingSales(prev => ({ ...prev, [productName]: timeoutId }));
    }
    
    // Update the last known count
    setLastItemCounts(prev => ({ ...prev, [productName]: currentItems }));
  };

  const logSale = async (productName: string, quantity: number, itemWeight: number) => {
    const now = new Date();
    const timestamp = now.getTime();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString();

    const saleData = {
      productName,
      quantity,
      itemWeight,
      timestamp,
      date,
      time
    };

    try {
      await push(ref(db, 'inventory/sales'), saleData);
      console.log(`✅ Sale logged: ${quantity} ${productName} items sold at ${time}`);
    } catch (error) {
      console.error('Error logging sale:', error);
    }
  };

  const clearAllSales = async () => {
    try {
      await remove(ref(db, 'inventory/sales'));
      console.log('All sales data cleared');
    } catch (error) {
      console.error('Error clearing sales:', error);
    }
  };

  const clearProductSales = async (productName: string) => {
    try {
      const salesRef = ref(db, 'inventory/sales');
      const snapshot = await new Promise<any>((resolve) => {
        onValue(salesRef, resolve, { onlyOnce: true });
      });
      
      const data = snapshot.val();
      if (data) {
        const removePromises = Object.entries(data)
          .filter(([_, sale]: [string, any]) => sale.productName === productName)
          .map(([id]) => remove(ref(db, `inventory/sales/${id}`)));
        
        await Promise.all(removePromises);
        console.log(`Sales data cleared for ${productName}`);
      }
    } catch (error) {
      console.error('Error clearing product sales:', error);
    }
  };

  const generateExcelReceipt = (type: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (type) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const filteredSales = salesData.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const productNames = [...new Set(filteredSales.map(sale => sale.productName))].sort();
    
    const excelData = [];
    
    const salesByDateTime = filteredSales.reduce((acc, sale) => {
      const key = `${sale.date}_${sale.time}`;
      if (!acc[key]) {
        acc[key] = {
          date: sale.date,
          time: sale.time,
          products: {}
        };
        productNames.forEach(name => {
          acc[key].products[name] = 0;
        });
      }
      acc[key].products[sale.productName] += sale.quantity;
      return acc;
    }, {} as any);

    Object.values(salesByDateTime).forEach((entry: any) => {
      const row: any = {
        'Date': entry.date,
        'Time': entry.time
      };
      
      productNames.forEach(productName => {
        row[`${productName} Sold`] = entry.products[productName] || 0;
      });
      
      excelData.push(row);
    });

    excelData.push({});
    
    const totalRow: any = {
      'Date': 'TOTAL',
      'Time': '',
       
    };

    productNames.forEach(productName => {
      const productTotal = filteredSales
        .filter(sale => sale.productName === productName)
        .reduce((sum, sale) => sum + sale.quantity, 0);
      totalRow[`${productName} Sold`] = productTotal;
    });

    excelData.push(totalRow);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length + 2, 12)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `${type.charAt(0).toUpperCase() + type.slice(1)} Sales`);

    const filename = `sales-data-log-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const today = new Date().toISOString().split('T')[0];
  const totalSoldToday = salesData
    .filter(sale => sale.date === today)
    .reduce((sum, sale) => sum + sale.quantity, 0);

  // Cleanup function
  useEffect(() => {
    return () => {
      Object.values(pendingSales).forEach(timer => clearTimeout(timer));
    };
  }, []);

  return {
    salesData,
    totalSoldToday,
    logSale,
    clearAllSales,
    clearProductSales,
    generateExcelReceipt,
    trackItemChange
  };
}