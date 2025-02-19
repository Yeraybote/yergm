// Importar Firebase (Asegurar que usas la misma versión en todo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Configuración de Firebase
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
const db = getDatabase(app);
const auth = getAuth(app);

/* 🔹 Registrar Usuario */
document.getElementById("registerUser").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const peso = document.getElementById("peso").value.trim();
    const altura = document.getElementById("altura").value.trim();

    // Validación: Comprobar que los campos no estén vacíos
    if (!nombre || !email || !password || !fechaNacimiento || !peso || !altura) {
        Swal.fire({
            icon: "warning",
            title: "Campos vacíos",
            text: "Por favor, completa todos los campos antes de continuar.",
        });
        return;
    }

    try {
        /* Crear usuario en Firebase Auth */
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid; 

        console.log("Datos que vamos a guardar en la base de datos:", {
            nombre: nombre,
            email: email,
            fechaNacimiento: fechaNacimiento,
            peso: peso,
            altura: altura,
        });

        // Guardar datos en Firebase Database
        await set(ref(db, "usuarios/" + userId), {
            nombre: nombre,
            email: email,
            fechaNacimiento: fechaNacimiento,
            peso: peso,
            altura: altura,
        });

        Swal.fire({
            icon: "success",
            title: "¡Registro exitoso!",
            text: "Tu cuenta ha sido creada correctamente.",
            confirmButtonText: "OK"
        }).then(() => {
            window.location.href = "./inicio.html"; // Redirigir al login
        });

    } catch (error) {
        console.error("Error en registro:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error en registro: " + error.message,
        });
    }
});

document.getElementById("goToLogin").addEventListener("click", () => {
    window.location.href = "../index.html";
});
