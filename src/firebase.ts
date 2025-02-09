import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD2mrqfJYZAtPkxua4YSqjP6NjDtJXbeAA",
    authDomain: "aljawas-a3504.firebaseapp.com",
    projectId: "aljawas-a3504",
    storageBucket: "aljawas-a3504.firebasestorage.app",
    messagingSenderId: "487279492235",
    appId: "1:487279492235:web:fc868275c8fc46629aa88e"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
