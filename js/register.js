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

    // Validación: Comprobar que el email sea válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            icon: "warning",
            title: "Email inválido",
            text: "Por favor, introduce un email válido.",
        });
        return;
    }

    // Validación: Comprobar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
        Swal.fire({
            icon: "warning",
            title: "Contraseña débil",
            text: "La contraseña debe tener al menos 6 caracteres.",
        });
        return;
    }

    // Validación: Comprobar que la fecha de nacimiento sea válida
    const fechaNacimientoDate = new Date(fechaNacimiento);
    if (isNaN(fechaNacimientoDate.getTime())) {
        Swal.fire({
            icon: "warning",
            title: "Fecha de nacimiento inválida",
            text: "Por favor, introduce una fecha de nacimiento válida.",
        });
        return;
    }

    // Validación: Comprobar que el peso y la altura sean números
    if (isNaN(peso) || isNaN(altura)) {
        Swal.fire({
            icon: "warning",
            title: "Peso o altura inválidos",
            text: "Por favor, introduce un peso y una altura válidos.",
        });
        return;
    }

    // Validación: Comprobar que el peso y la altura sean positivos
    if (peso <= 0 || altura <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Peso o altura inválidos",
            text: "Por favor, introduce un peso y una altura válidos.",
        });
        return;
    }


    try {
        /* Crear usuario en Firebase Auth */
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid; 

        /* console.log("Datos que vamos a guardar en la base de datos:", {
            nombre: nombre,
            email: email,
            fechaNacimiento: fechaNacimiento,
            peso: peso,
            altura: altura,
        }); */

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

// Al darle al logo quiero que me lleve a la página de index.html
document.getElementById("logo").addEventListener("click", () => {
    location.href = "../index.html";
});