import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDNTwldxdyE7JOv8KwLcaWblo1AKvKEnQA",
  authDomain: "pointacademykwt.firebaseapp.com",
  projectId: "pointacademykwt",
  storageBucket: "pointacademykwt.appspot.com",
  messagingSenderId: "645987319659",
  appId: "1:645987319659:web:935e281db66c628bc4d62e",
  measurementId: "G-R907W01014"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير قواعد البيانات والتخزين
export const db = getFirestore(app);
export const storage = getStorage(app);
