import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";  // ✅ import Auth
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7UtPJo2qX2qi3WhEkjO9AlG1LMqmLD9A",
  authDomain: "evaluation-d6a2f.firebaseapp.com",
  databaseURL: "https://evaluation-d6a2f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "evaluation-d6a2f",
  storageBucket: "evaluation-d6a2f.firebasestorage.app",
  messagingSenderId: "523906806011",
  appId: "1:523906806011:web:3beebcb6a736728c14005e",
  measurementId: "G-3Q889PBY8B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);        // used for register/login
export const db = getFirestore(app);  
export const provider = new GoogleAuthProvider();   // used for Firestore data storage
