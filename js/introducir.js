// Importar los módulos necesarios desde Firebase 9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";


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

// Función para agregar o actualizar medición a la base de datos
function agregarOActualizarMedicion(id, fecha, gimnasio, batido, descanso) {

  // Consigue el mail a través de FirebaseAuth
  const auth = getAuth();
  var email = null;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      //console.log("Usuario autenticado:", user.email);
      email = user.email;

      // Buscamos la medición para esa fecha y email
      const medicionRef = ref(database, 'mediciones/');
      get(medicionRef).then(snapshot => {
        const mediciones = snapshot.val();
        let medicionExistente = null;

        // Recorremos las mediciones para buscar una existente para la misma fecha y email
        for (const key in mediciones) {
          if (mediciones[key].fecha === fecha && mediciones[key].email === email) {
            medicionExistente = key;  // Si encontramos la medición, obtenemos el ID
            break;
          }
        }

        if (medicionExistente) {
          // Si existe, actualizamos la medición existente
          update(ref(database, 'mediciones/' + medicionExistente), {
            gimnasio: gimnasio,
            batido: batido,
            descanso: descanso
          });
        } else {
          // Si no existe, agregamos una nueva medición
          set(ref(database, 'mediciones/' + id), {
            email: email,
            fecha: fecha,
            gimnasio: gimnasio,
            batido: batido,
            descanso: descanso
          });
        }
        
      }).catch(error => {
        console.error('Error al verificar la medición:', error);
      });
      
    } else {
      //console.log("No hay usuario autenticado.");
    }
  });

  
}

// Función para buscar medición por fecha y email
function buscarMedicion(fecha, email) {
  // console.log(email);
  const medicionesRef = ref(database, 'mediciones');
  return get(medicionesRef).then(snapshot => {
    const mediciones = snapshot.val();
    if (mediciones) {
      // Buscar la medición con la fecha y el email específico
      for (const key in mediciones) {
        if (mediciones[key].fecha === fecha && mediciones[key].email === email) {
          return mediciones[key];  // Si se encuentra, devolvemos la medición
        }
      }
    }
    return null; // Si no existe medición
  });
}

// Al seleccionar la fecha, verificamos si ya existe una medición para esa fecha
document.getElementById('fecha').addEventListener('change', function () {
  const fechaSeleccionada = this.value;

  // Obtener autenticación de Firebase
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = user.email; // Aquí ya tenemos el email garantizado
      // console.log("Usuario autenticado:", email);

      if (fechaSeleccionada && email) {
        // Buscar la medición en la base de datos
        buscarMedicion(fechaSeleccionada, email)
          .then(medicion => {
            if (medicion) {
              // Si se encuentra una medición, marcamos los checkboxes correspondientes
              document.getElementById('gimnasio').checked = medicion.gimnasio === 'X';
              document.getElementById('batido').checked = medicion.batido === 'X';
              document.getElementById('descanso').checked = medicion.descanso === 'X';
            } else {
              // Si no hay medición para esa fecha, aseguramos que los checkboxes estén desmarcados
              document.getElementById('gimnasio').checked = false;
              document.getElementById('batido').checked = false;
              document.getElementById('descanso').checked = false;
            }
          })
          .catch(error => {
            console.error('Error al buscar la medición:', error);
          });
      }
    } else {
      console.log("No hay usuario autenticado.");
    }
  });
});

// Escuchar el evento de submit del formulario
document.getElementById('formMedicion').addEventListener('submit', function(event) {
  event.preventDefault();

  // Obtener los valores del formulario
  const fecha = document.getElementById('fecha').value;
  const gimnasio = document.getElementById('gimnasio').checked ? 'X' : ''; // Guardamos 'X' si está marcado
  const batido = document.getElementById('batido').checked ? 'X' : ''; // Guardamos 'X' si está marcado
  const descanso = document.getElementById('descanso').checked ? 'X' : ''; // Guardamos 'X' si está marcado

  // Crear un ID único para la medición (puedes usar otro método si prefieres)
  const medicionId = new Date().getTime();  // Usamos el timestamp como ID único para cada medición

  // Llamamos a la función para agregar o actualizar la medición en la base de datos
  agregarOActualizarMedicion(medicionId, fecha, gimnasio, batido, descanso);

  // SweetAlert2: Mostrar mensaje de éxito
  Swal.fire({
    icon: "success",
    title: "¡Éxito!",
    text: "Medición guardada correctamente",
  });

  // Limpiar el formulario
  document.getElementById('formMedicion').reset();
});

// Al darle al logo quiero que me lleve a la página de inicio.html
document.getElementById("logo").addEventListener("click", () => {
  location.href = "./inicio.html";
});
