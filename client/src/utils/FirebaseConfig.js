import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyDczMgod2lYDKt3SyBhzShvpTCDsHhTL6c",
    authDomain: "whatsapp-clone-8d521.firebaseapp.com",
    projectId: "whatsapp-clone-8d521",
    storageBucket: "whatsapp-clone-8d521.firebasestorage.app",
    messagingSenderId: "240828805310",
    appId: "1:240828805310:web:eb1f1e35d1487ba961aeef",
    measurementId: "G-4XJEF14XWL"
  };

  const app = initializeApp(firebaseConfig);
  export const firebaseauth = getAuth(app);