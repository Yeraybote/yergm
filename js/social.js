// Importar Firebase (Asegurar que usas las versiones correctas)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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
const auth = getAuth();
let email;
let userUuid;

// Esperar a que el usuario inicie sesión
onAuthStateChanged(auth, async (user) => {
    if (user) {
        email = user.email;

        /* Quiero poner el uuid del usuario en el apartado de Añadir amigo, para que a la hora de añadir un amigo, se añada por el uuid del usuario
        const userRef = ref(db, `usuarios`);
        const userSnapshot = await get(query(userRef, orderByChild("email"), equalTo(email)));
        const userData = userSnapshot.val();
        const userKey = Object.keys(userData)[0];
        userUuid = userData[userKey]; */


    } else {
        Swal.fire({
            icon: "warning",
            title: "No has iniciado sesión",
            text: "Por favor, inicia sesión para ver tus estadísticas.",
        }).then(() => {
            window.location.href = "../index.html";
        });
    }
});

