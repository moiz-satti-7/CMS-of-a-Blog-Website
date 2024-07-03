// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBv29BbXk3DCzGLR_uPl3f4rSNUZLBMQ4Q",
  authDomain: "test-project-for-ci-cd.firebaseapp.com",
  databaseURL: "https://test-project-for-ci-cd-default-rtdb.firebaseio.com",
  projectId: "test-project-for-ci-cd",
  storageBucket: "test-project-for-ci-cd.appspot.com",
  messagingSenderId: "287309597886",
  appId: "1:287309597886:web:3e94d531acc5b839de22ef",
  measurementId: "G-9D48VZXXEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot };
