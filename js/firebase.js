// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOqk4yknDjabdi7qg8C6eZZHjxl8s7__s",
  authDomain: "yergm-2e46e.firebaseapp.com",
  projectId: "yergm-2e46e",
  storageBucket: "yergm-2e46e.appspot.com", // Corregido
  messagingSenderId: "297685733611",
  appId: "1:297685733611:web:602cb77eba1240f297aeae",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exportar auth para login
export const db = getFirestore(app); // Exportar Firestore