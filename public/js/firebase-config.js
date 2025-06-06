// Substitua pelos dados do seu Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKaeVS4NiOo2LQqm7M_dQge1paqSAjblk",
  authDomain: "comsum-v4.firebaseapp.com",
  projectId: "comsum-v4",
  storageBucket: "comsum-v4.firebasestorage.app",
  messagingSenderId: "781309250183",
  appId: "1:781309250183:web:2cce8c5c90ed4154598622"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


