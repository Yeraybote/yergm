// Importar los módulos necesarios desde Firebase 9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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
    // Referencia a la base de datos de usuarios
    const usuariosRef = ref(database, 'usuarios');

    // Filtrar por el email del usuario autenticado
    get(query(usuariosRef, orderByChild('email'), equalTo(user.email)))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const usuarios = snapshot.val();
          const usuario = Object.values(usuarios)[0]; // Ya solo hay uno porque estamos filtrando por el email

          // Mostrar la información del usuario en la interfaz
          document.getElementById("titulo").innerText = "¡Bienvenid@, " + usuario.nombre + "!";
        } else {
          console.log("No se encontró el usuario.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los datos del usuario:", error);
      });

  } else {
    location.href = "../index.html"; // Redirige al login si no hay un usuario autenticado
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


