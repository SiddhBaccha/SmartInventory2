import { useState, useEffect } from 'react';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { db } from '../config/firebase';
import { sendEmailAlert } from '../utils/emailService';

interface ProductData {
  name: string;
  total_weight: number;
  item_weight: number;
  items_left: number;
  lastUpdated: number;
  isOnline: boolean;
  lastSaleTime?: number;
  previousItemsLeft?: number;
  lowStockThreshold: number;
  theftThreshold: number;
  refillCount?: number;
  heartbeat?: number;
}

interface Alert {
  id: string;
  productName: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const HEARTBEAT_TIMEOUT = 60000; // 60 seconds - more realistic for ESP8266
const DEFAULT_ITEM_WEIGHT = 7.8;
const REFILL_DELAY = 60000; // 1 minute delay for refill detection
const EMAIL_COOLDOWN = 2 * 60 * 60 * 1000; // 2 hours cooldown for duplicate alerts

export function useFirebaseData() {
  const [products, setProducts] = useState<Record<string, ProductData>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [processedAlerts, setProcessedAlerts] = useState<Set<string>>(new Set());
  const [previousProducts, setPreviousProducts] = useState<Record<string, ProductData>>({});
  const [refillTimers, setRefillTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const [lastEmailSent, setLastEmailSent] = useState<Record<string, number>>({});

  useEffect(() => {
    const inventoryRef = ref(db, 'inventory');

    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      const firebaseData = snapshot.val();
      const now = Date.now();

      if (firebaseData) {
        const processedProducts: Record<string, ProductData> = {};

        Object.entries(firebaseData).forEach(([productId, productData]: [string, any]) => {
          if (!productId.startsWith('product')) return;

          // Strict heartbeat checking - product starts offline and only goes online with recent heartbeat
          const heartbeat = productData?.heartbeat ? productData.heartbeat * 1000 : null;
          const isOnline = heartbeat ? (now - heartbeat) < HEARTBEAT_TIMEOUT : false;

          const currentItemsLeft = productData?.items_left ?? Math.floor((productData?.total_weight || 0) / (productData?.item_weight || DEFAULT_ITEM_WEIGHT));
          const previousItemsLeft = previousProducts[productId]?.items_left ?? currentItemsLeft;

          // Handle refill detection with 1-minute delay - only for online products
          let refillCount = productData?.refillCount || 0;
          if (previousItemsLeft < currentItemsLeft && isOnline) {
            const itemsAdded = currentItemsLeft - previousItemsLeft;
            
            // Clear existing timer if any
            if (refillTimers[productId]) {
              clearTimeout(refillTimers[productId]);
            }
            
            // Set 1-minute timer for refill confirmation
            const timer = setTimeout(async () => {
              try {
                const newRefillCount = refillCount + itemsAdded;
                await set(ref(db, `inventory/${productId}/refillCount`), newRefillCount);
                console.log(`Refill detected: ${itemsAdded} items added to ${productData?.name || productId}`);
              } catch (error) {
                console.error('Error updating refill count:', error);
              }
              
              // Clean up timer
              setRefillTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[productId];
                return newTimers;
              });
            }, REFILL_DELAY);
            
            setRefillTimers(prev => ({ ...prev, [productId]: timer }));
          }

          processedProducts[productId] = {
            name: productData?.name || `Product ${productId.replace('product', '')}`,
            total_weight: productData?.total_weight || 0,
            item_weight: productData?.item_weight || DEFAULT_ITEM_WEIGHT,
            items_left: currentItemsLeft,
            lastUpdated: productData?.lastUpdated ? productData.lastUpdated * 1000 : 0,
            isOnline,
            lastSaleTime: productData?.lastSaleTime ? productData.lastSaleTime * 1000 : null,
            previousItemsLeft: previousItemsLeft,
            lowStockThreshold: productData?.lowStockThreshold || 2,
            theftThreshold: productData?.theftThreshold || 5.0,
            refillCount: refillCount,
            heartbeat: heartbeat
          };
        });

        setPreviousProducts(processedProducts);
        setProducts(processedProducts);
      } else {
        // Initialize with offline products
        const defaultProducts = {
          product1: {
            name: 'Product 1',
            total_weight: 0,
            item_weight: DEFAULT_ITEM_WEIGHT,
            items_left: 0,
            lastUpdated: 0,
            isOnline: false,
            previousItemsLeft: 0,
            lowStockThreshold: 2,
            theftThreshold: 5.0,
            refillCount: 0,
            heartbeat: null
          },
          product2: {
            name: 'Product 2',
            total_weight: 0,
            item_weight: DEFAULT_ITEM_WEIGHT,
            items_left: 0,
            lastUpdated: 0,
            isOnline: false,
            previousItemsLeft: 0,
            lowStockThreshold: 2,
            theftThreshold: 5.0,
            refillCount: 0,
            heartbeat: null
          }
        };
        setProducts(defaultProducts);
        setPreviousProducts(defaultProducts);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      // Clean up all timers
      Object.values(refillTimers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const alertsRef = ref(db, 'inventory/alerts');

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      const allAlerts: Alert[] = [];

      if (data) {
        Object.entries(data).forEach(([id, alert]: [string, any]) => {
          if (typeof alert === 'object' && alert.productName) {
            allAlerts.push({
              id,
              ...alert,
              timestamp: alert.timestamp || Date.now()
            });
          }
        });
      }

      const uniqueAlerts = allAlerts.filter((alert, index, self) => {
        const duplicateIndex = self.findIndex(a => 
          a.productName === alert.productName && 
          a.message === alert.message &&
          Math.abs(a.timestamp - alert.timestamp) < 5 * 60 * 1000
        );
        return duplicateIndex === index;
      });

      setAlerts(uniqueAlerts.sort((a, b) => b.timestamp - a.timestamp));
    });

    return () => unsubscribe();
  }, []);

  const updateProductName = async (productId: string, name: string) => {
    if (!name || name.trim() === '') throw new Error('Product name cannot be empty');
    await set(ref(db, `inventory/${productId}/name`), name.trim());
  };

  const updateProductWeight = async (productId: string, weight: number) => {
    if (!weight || weight <= 0) throw new Error('Item weight must be greater than 0');
    await set(ref(db, `inventory/${productId}/item_weight`), Number(weight));
  };

  const updateLowStockThreshold = async (productId: string, threshold: number) => {
    if (threshold < 0) throw new Error('Threshold cannot be negative');
    await set(ref(db, `inventory/${productId}/lowStockThreshold`), Number(threshold));
  };

  const updateTheftThreshold = async (productId: string, threshold: number) => {
    if (threshold < 0) throw new Error('Theft threshold cannot be negative');
    await set(ref(db, `inventory/${productId}/theftThreshold`), Number(threshold));
  };

  const logAlert = async (productName: string, message: string) => {
    const alertKey = `${productName}-${message}`;
    const emailKey = `${productName}-${message.split(' ')[0]}`; // Group similar alerts for email cooldown
    const now = Date.now();
    
    if (!processedAlerts.has(alertKey)) {
      await push(ref(db, 'inventory/alerts'), {
        productName,
        message,
        timestamp: now,
        read: false
      });
      
      // Send email alert with cooldown
      const lastSent = lastEmailSent[emailKey] || 0;
      if (now - lastSent > EMAIL_COOLDOWN) {
        try {
          const product = Object.values(products).find((p: any) => p.name === productName);
          let emailSubject = '';
          let emailBody = '';
          
          if (message.includes('Out of Stock')) {
            emailSubject = `🚨 OUT OF STOCK ALERT - ${productName}`;
            emailBody = `
              <h2 style="color: #dc2626;">OUT OF STOCK ALERT</h2>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Status:</strong> Out of Stock (0 items remaining)</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p style="color: #dc2626;"><strong>Action Required:</strong> Immediate restocking needed!</p>
            `;
          } else if (message.includes('Low Stock')) {
            emailSubject = `⚠️ LOW STOCK WARNING - ${productName}`;
            emailBody = `
              <h2 style="color: #f59e0b;">LOW STOCK WARNING</h2>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Items Left:</strong> ${product?.items_left || 'Unknown'}</p>
              <p><strong>Threshold:</strong> ${product?.lowStockThreshold || 2}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p style="color: #f59e0b;"><strong>Action Required:</strong> Consider restocking soon!</p>
            `;
          } else if (message.includes('THEFT')) {
            emailSubject = `🚨 THEFT ALERT - ${productName}`;
            emailBody = `
              <h2 style="color: #dc2626;">THEFT DETECTION ALERT</h2>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Alert:</strong> ${message}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p style="color: #dc2626;"><strong>Action Required:</strong> Immediate investigation needed!</p>
            `;
          }
          
          if (emailSubject && emailBody) {
            await sendEmailAlert(emailSubject, emailBody);
            setLastEmailSent(prev => ({ ...prev, [emailKey]: now }));
          }
        } catch (emailError) {
          console.error('Failed to send email alert:', emailError);
        }
      }
      
      setProcessedAlerts(prev => new Set(prev).add(alertKey));
      setTimeout(() => {
        setProcessedAlerts(prev => {
          const newSet = new Set(prev);
          newSet.delete(alertKey);
          return newSet;
        });
      }, 5 * 60 * 1000);
    }
  };

  const clearAlert = async (alertId: string) => {
    await remove(ref(db, `inventory/alerts/${alertId}`));
  };

  const clearAllAlerts = async () => {
    await remove(ref(db, 'inventory/alerts'));
    setProcessedAlerts(new Set());
  };

  const clearRefillData = async () => {
    const updatePromises = Object.keys(products).map(async (productId) => {
      await set(ref(db, `inventory/${productId}/refillCount`), 0);
    });
    await Promise.all(updatePromises);
  };

  const clearProductRefill = async (productId: string) => {
    await set(ref(db, `inventory/${productId}/refillCount`), 0);
  };

  const addProduct = async () => {
    const existingNumbers = Object.keys(products)
      .map(key => parseInt(key.replace('product', '')))
      .filter(num => !isNaN(num));
    const nextNumber = Math.max(...existingNumbers, 0) + 1;
    const newProductId = `product${nextNumber}`;
    const newProduct = {
      name: `Product ${nextNumber}`,
      total_weight: 0,
      item_weight: DEFAULT_ITEM_WEIGHT,
      items_left: 0,
      lastUpdated: 0,
      previousItemsLeft: 0,
      lowStockThreshold: 2,
      theftThreshold: 5.0,
      refillCount: 0,
      isOnline: false,
      heartbeat: 0
    };
    await set(ref(db, `inventory/${newProductId}`), newProduct);
  };

  const deleteProduct = async (productId: string) => {
    // Clear any pending refill timer
    if (refillTimers[productId]) {
      clearTimeout(refillTimers[productId]);
      setRefillTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[productId];
        return newTimers;
      });
    }
    await remove(ref(db, `inventory/${productId}`));
  };

  return {
    products,
    alerts,
    loading,
    updateProductName,
    updateProductWeight,
    updateLowStockThreshold,
    updateTheftThreshold,
    logAlert,
    clearAlert,
    clearAllAlerts,
    clearRefillData,
    clearProductRefill,
    addProduct,
    deleteProduct
  };
}