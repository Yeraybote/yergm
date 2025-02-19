// Importar los módulos necesarios desde Firebase 9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Tu configuración de Firebase (reemplaza con tu propia configuración)
const firebaseConfig = {
    apiKey: "AIzaSyCOqk4yknDjabdi7qg8C6eZZHjxl8s7__s",
    authDomain: "yergm-2e46e.firebaseapp.com",
    databaseURL: "https://yergm-2e46e-default-rtdb.firebaseio.com/",
    projectId: "yergm-2e46e",
    storageBucket: "yergm-2e46e.appspot.com",
    messagingSenderId: "297685733611",
    appId: "1:297685733611:web:602cb77eba1240f297aeae",
};
  
// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Según carge la página, quiero que se le añada el email del usuario autenticado al titulo con id "titulo"
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Quiero solo la parte de antes del @
    let email = user.email.split("@")[0];
    document.getElementById("titulo").innerText = "¡Bienvenid@, " + email + "!";
  } else {
    location.href = "../index.html";
  }
});

// Al darle al botón de "introducir" quiero que me lleve a la página de introducir.html
document.getElementById("introducir").addEventListener("click", () => {
  location.href = "./introducir.html";
});

// Al darle al botón de "estadisticas" quiero que me lleve a la página de estadisticas.html
document.getElementById("estadisticas").addEventListener("click", () => {
  location.href = "./estadisticas.html";
});

/* 🔹 Cerrar sesión con confirmación */
document.getElementById("logout").addEventListener("click", async () => {
  Swal.fire({
      title: "¿Seguro que quieres cerrar sesión?",
      text: "Tendrás que volver a iniciar sesión para acceder de nuevo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar"
  }).then(async (result) => {
      if (result.isConfirmed) {
          await signOut(auth);
      }
  });
});


