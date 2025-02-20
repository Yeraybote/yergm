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
let usuario = null;

// Según carge la página, quiero que se le añada el email del usuario autenticado al titulo con id "titulo"
const auth = getAuth();

// Activar el fondo borroso
document.getElementById("content-container").classList.add("loading");

onAuthStateChanged(auth, (user) => {
    if (user) {
      // Mostrar el indicador de carga (spinner)
      document.getElementById("loading").style.display = "block";
  
      // Referencia a la base de datos de usuarios
      const usuariosRef = ref(database, 'usuarios');
  
      // Filtrar por el email del usuario autenticado
      get(query(usuariosRef, orderByChild('email'), equalTo(user.email)))
        .then((snapshot) => {
          if (snapshot.exists()) {
            const usuarios = snapshot.val();
  
            // Mostrar la información del usuario en la interfaz
            usuario = Object.values(usuarios)[0]; // Ya solo hay uno porque estamos filtrando por el email

            // Necesito guardar el id del usuario para poder actualizarlo después
            usuario.id = Object.keys(usuarios)[0];

            document.getElementById("nombre").value = usuario.nombre;
            document.getElementById("email").value = usuario.email;
            document.getElementById("fechaNacimiento").value = usuario.fechaNacimiento;
            document.getElementById("peso").value = usuario.peso;
            document.getElementById("altura").value = usuario.altura;
  
            // Ocultar el indicador de carga después de cargar los datos
            document.getElementById("loading").style.display = "none";
            // Eliminar el fondo borroso
            document.getElementById("content-container").classList.remove("loading");
          } else {
            console.log("No se encontró el usuario.");
            // Ocultar el indicador de carga en caso de error
            document.getElementById("loading").style.display = "none";
            // Eliminar el fondo borroso
            document.getElementById("content-container").classList.remove("loading");
          }
        })
        .catch((error) => {
          console.error("Error al obtener los datos del usuario:", error);
          // Ocultar el indicador de carga en caso de error
          document.getElementById("loading").style.display = "none";
          // Eliminar el fondo borroso
          document.getElementById("content-container").classList.remove("loading");
        });
  
    } else {
      location.href = "../index.html"; // Redirige al login si no hay un usuario autenticado
    }
});

document.getElementById("editarPerfil").addEventListener("click", function() {
    // Activar campos para edición
    document.getElementById("nombre").disabled = false;
    document.getElementById("fechaNacimiento").disabled = false;
    document.getElementById("peso").disabled = false;
    document.getElementById("altura").disabled = false;

    // Cambiar el color de fondo de los inputs a blanco y el texto a negro
    document.getElementById("nombre").style.backgroundColor = "#fff";
    document.getElementById("nombre").style.color = "#000";

    document.getElementById("fechaNacimiento").style.backgroundColor = "#fff";
    document.getElementById("fechaNacimiento").style.color = "#000";

    document.getElementById("peso").style.backgroundColor = "#fff";
    document.getElementById("peso").style.color = "#000";

    document.getElementById("altura").style.backgroundColor = "#fff";
    document.getElementById("altura").style.color = "#000";

    // Mostrar el botón de guardar
    document.getElementById("guardarPerfil").style.display = "inline-block";
    document.getElementById("editarPerfil").style.display = "none";
});


document.getElementById("guardarPerfil").addEventListener("click", function() {
    // Obtener los valores de los campos de entrada
    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let fechaNacimiento = document.getElementById("fechaNacimiento").value;
    let peso = document.getElementById("peso").value;
    let altura = document.getElementById("altura").value;

    // Actualizar la información en Firebase
    const usuarioRef = ref(database, `usuarios/${usuario.id}`); // Usamos el id del usuario

    // Actualizar el usuario con los nuevos valores
    update(usuarioRef, {
        nombre: nombre,
        email: email,
        fechaNacimiento: fechaNacimiento,
        peso: peso,
        altura: altura
    })
    .then(() => {

        // Mostrar un mensaje de éxito
        Swal.fire({
            title: "¡Perfil actualizado!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });

    })
    .catch((error) => {
        console.error("Error al actualizar el usuario:", error);
    });

    // Después de guardar, deshabilitar los campos nuevamente
    document.getElementById("nombre").disabled = true;
    document.getElementById("email").disabled = true;
    document.getElementById("fechaNacimiento").disabled = true;
    document.getElementById("peso").disabled = true;
    document.getElementById("altura").disabled = true;

    // Cambiar el color de fondo de los inputs a gris y el texto a blanco
    document.getElementById("nombre").style.backgroundColor = "#48677b";
    document.getElementById("nombre").style.color = "white";

    document.getElementById("fechaNacimiento").style.backgroundColor = "#48677b";
    document.getElementById("fechaNacimiento").style.color = "white";

    document.getElementById("peso").style.backgroundColor = "#48677b";
    document.getElementById("peso").style.color = "white";

    document.getElementById("altura").style.backgroundColor = "#48677b";
    document.getElementById("altura").style.color = "white";

    // Mostrar el botón de editar y ocultar el de guardar
    document.getElementById("guardarPerfil").style.display = "none";
    document.getElementById("editarPerfil").style.display = "inline-block";
});


document.getElementById("volver").addEventListener("click", function() {
    window.location.href = "inicio.html";  // Redirige al inicio
});

// Al darle al logo quiero que me lleve a la página de inicio.html
document.getElementById("logo").addEventListener("click", () => {
    location.href = "./inicio.html";
});