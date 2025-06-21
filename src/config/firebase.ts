import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCUawUr-MBbFhoIsHIFmu-kIoo7cuNsMgE",
  authDomain: "smart-inventory-manageme-b6c39.firebaseapp.com",
  databaseURL: "https://smart-inventory-manageme-b6c39-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smart-inventory-manageme-b6c39",
  storageBucket: "smart-inventory-manageme-b6c39.appspot.com",
  messagingSenderId: "352065422117",
  appId: "1:352065422117:web:45b7bf2a71644bf850d0cc"
};

// Prevent reinitializing on HMR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getDatabase(app);
export const auth = getAuth(app);
