// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNTwldxdyE7JOv8KwLcaWblo1AKvKEnQA",
  authDomain: "pointacademykwt.firebaseapp.com",
  projectId: "pointacademykwt",
  storageBucket: "pointacademykwt.appspot.com",
  messagingSenderId: "645987319659",
  appId: "1:645987319659:web:935e281db66c628bc4d62e",
  measurementId: "G-R907W01014"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
