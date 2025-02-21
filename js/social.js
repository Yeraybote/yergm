import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
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
const database = getDatabase(app);
const auth = getAuth();
let email;
let userUuid;

/* Esperar a que el usuario inicie sesión */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        email = user.email;

        // Obtener el UUID del usuario
        const userQuery = query(ref(database, "usuarios"), orderByChild("email"), equalTo(email));
        const userSnapshot = await get(userQuery);
        userUuid = Object.keys(userSnapshot.val())[0];

        // Mostrar los amigos después de que el usuario haya iniciado sesión
        mostrarAmigos(userUuid);

        // Resto de la lógica de eventos
        const btnGenerarEnlace = document.getElementById("generar-enlace");
        const enlaceContainer = document.getElementById("enlace-container");
        const inputEnlace = document.getElementById("enlace-amistad");
        const btnCopiarEnlace = document.getElementById("copiar-enlace");
    
        if (btnGenerarEnlace) {
            btnGenerarEnlace.addEventListener("click", generarEnlaceAmistad);
        }
    
        if (btnCopiarEnlace) {
            btnCopiarEnlace.addEventListener("click", () => {
                inputEnlace.select();
                document.execCommand("copy");
                Swal.fire("¡Copiado!", "El enlace ha sido copiado al portapapeles.", "success");
            });
        }
    
        // Detectar si hay un token en la URL y procesarlo
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        if (token) {
            unirseDesdeEnlace(token);
        }

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

// Función para mostrar la lista de amigos con nombres
async function mostrarAmigos(userUuid) {
    const amigosRef = ref(database, `amigos/${userUuid}`);
    const amigosSnapshot = await get(amigosRef);

    if (amigosSnapshot.exists()) {
        const amigosData = amigosSnapshot.val();
        const listaAmigos = document.getElementById("lista-amigos");
        listaAmigos.innerHTML = ''; // Limpiar la lista antes de llenarla

        // Iterar sobre los amigos y obtener sus nombres
        for (let amigoId in amigosData) {
            // Hacer una consulta para obtener el nombre de cada amigo
            const amigoRef = ref(database, `usuarios/${amigoId}`); // Suponiendo que los usuarios están en la ruta "usuarios"
            const amigoSnapshot = await get(amigoRef);

            if (amigoSnapshot.exists()) {
                const amigoData = amigoSnapshot.val();
                const amigoNombre = amigoData.nombre || "Nombre desconocido"; // Usar el nombre si existe, de lo contrario "Nombre desconocido"

                // Crear un nuevo elemento de lista con el nombre del amigo
                const listItem = document.createElement("li");
                listItem.classList.add("list-group-item");
                listItem.textContent = amigoNombre;

                listaAmigos.appendChild(listItem);
            }
        }
    } else {
        const listaAmigos = document.getElementById("lista-amigos");
        listaAmigos.innerHTML = '<li class="list-group-item">No tienes amigos aún.</li>';
    }
}

// Función para generar enlace de amistad
function generarEnlaceAmistad() {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire("Error", "Debes iniciar sesión para generar un enlace de amistad.", "error");
        return;
    }

    const token = Math.random().toString(36).substr(2, 10);
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

    set(ref(database, `invitaciones/${token}`), {
        sender: user.uid,
        expiresAt
    }).then(() => {
        const enlace = `${window.location.origin}/social.html?token=${token}`;
        document.getElementById("enlace-container").classList.remove("d-none");
        document.getElementById("enlace-amistad").value = enlace;
        Swal.fire("¡Enlace generado!", "Comparte este enlace con tus amigos.", "success");
    }).catch(error => {
        Swal.fire("Error", "No se pudo generar el enlace.", "error");
        console.error(error);
    });
}

function unirseDesdeEnlace(token) {
    const inviteRef = ref(database, `invitaciones/${token}`);

    get(inviteRef).then(snapshot => {
        const data = snapshot.val();
        if (!data) {
            Swal.fire("Error", "El enlace no es válido.", "error");
            return;
        }

        if (data.expiresAt < Date.now()) {
            Swal.fire("Error", "El enlace ha expirado.", "error");
            remove(inviteRef); // Borra el enlace si ha expirado
            return;
        }

        const senderUid = data.sender;

        if (senderUid === userUuid) {
            Swal.fire("Error", "No puedes añadirte a ti mismo.", "error");
            return;
        }

        // Agregar a la lista de amigos en Firebase
        set(ref(database, `amigos/${senderUid}/${userUuid}`), true);
        set(ref(database, `amigos/${userUuid}/${senderUid}`), true);

        // Eliminar la invitación después de usarse
        // remove(inviteRef); Asi se puede reutilizar el enlace hasta que expire

        Swal.fire("¡Éxito!", "Ahora sois amigos.", "success");

        // Actualizar la lista de amigos
        mostrarAmigos(userUuid);

    }).catch(error => {
        Swal.fire("Error", "Hubo un problema al aceptar la solicitud.", "error");
        console.error(error);
    });
}


// Al darle al "logo", volvemos a inicio
document.getElementById("logo").addEventListener("click", () => {
    window.location.href = "./inicio.html";
});