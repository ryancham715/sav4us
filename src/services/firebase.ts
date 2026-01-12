import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALkn1E18Kce4hlAaNNvCH0gKsCPkxa0b4",
  authDomain: "sav4us.firebaseapp.com",
  projectId: "sav4us",
  storageBucket: "sav4us.firebasestorage.app",
  messagingSenderId: "696328403078",
  appId: "1:696328403078:web:ffeb45e12b2aeaa9a8b907"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
