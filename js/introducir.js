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

// Quiero que de primeras me aparezca la fecha de hoy en el input de fecha y compruebe si hay una medición para esa fecha
// Obtener la fecha actual en formato DD/MM/YYYY
const hoy = new Date();
const dd = String(hoy.getDate()).padStart(2, '0');
const mm = String(hoy.getMonth() + 1).padStart(2, '0');
const yyyy = hoy.getFullYear();
const fechaActual = `${yyyy}-${mm}-${dd}`;

//  Array para guardar los tipos de entrenamiento seleccionados
let entrenamientos = [];

// Asignar la fecha actual al input de fecha
document.getElementById('fecha').value = fechaActual;

// Comprobar si hay una medición para la fecha actual
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    const email = user.email; // Aquí ya tenemos el email garantizado
    // console.log("Usuario autenticado:", email);

    buscarMedicion(fechaActual, email)
      .then(medicion => {
        if (medicion) {
          // Si se encuentra una medición, marcamos los checkboxes correspondientes
          document.getElementById('gimnasio').checked = medicion.gimnasio === 'X';
          document.getElementById('batido').checked = medicion.batido === 'X';
          document.getElementById('descanso').checked = medicion.descanso === 'X';

          // Marcar los checkboxes de entrenamiento si existen
          document.getElementById('entrenamientoPecho').checked = medicion.pecho === 'X';
          document.getElementById('entrenamientoHombro').checked = medicion.hombro === 'X';
          document.getElementById('entrenamientoTriceps').checked = medicion.triceps === 'X';
          document.getElementById('entrenamientoEspalda').checked = medicion.espalda === 'X';
          document.getElementById('entrenamientoBiceps').checked = medicion.biceps === 'X';
          document.getElementById('entrenamientoPierna').checked = medicion.pierna === 'X';
          document.getElementById('entrenamientoCardio').checked = medicion.cardio === 'X';

        } else {
          // Si no hay medición para esa fecha, aseguramos que los checkboxes estén desmarcados
          document.getElementById('gimnasio').checked = false;
          document.getElementById('batido').checked = false;
          document.getElementById('descanso').checked = false;

          // Desmarcar los checkboxes de entrenamiento
          document.getElementById('entrenamientoPecho').checked = false;
          document.getElementById('entrenamientoHombro').checked = false;
          document.getElementById('entrenamientoTriceps').checked = false;
          document.getElementById('entrenamientoEspalda').checked = false;
          document.getElementById('entrenamientoBiceps').checked = false;
          document.getElementById('entrenamientoPierna').checked = false;
          document.getElementById('entrenamientoCardio').checked = false;

        }
      })
      .catch(error => {
        console.error('Error al buscar la medición:', error);
      });
  } else {
    console.log("No hay usuario autenticado.");
  }
});

// Función para agregar o actualizar medición a la base de datos
function agregarOActualizarMedicion(id, fecha, gimnasio, batido, descanso) {
  const auth = getAuth();
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = user.email;

      // Buscamos si ya existe una medición con la misma fecha y email
      const medicionRef = ref(database, 'mediciones/');
      get(medicionRef).then(snapshot => {
        const mediciones = snapshot.val();
        let medicionExistente = null;

        // Buscar si ya existe una medición para la misma fecha y email
        for (const key in mediciones) {
          if (mediciones[key].fecha === fecha && mediciones[key].email === email) {
            medicionExistente = key;  // Guardamos el ID existente
            break;
          }
        }

        const nuevaMedicion = {
          email: email,
          fecha: fecha,
          gimnasio: gimnasio,
          batido: batido,
          descanso: descanso,
          pecho: entrenamientos.includes("Pecho") ? "X" : "",
          hombro: entrenamientos.includes("Hombro") ? "X" : "",
          triceps: entrenamientos.includes("Triceps") ? "X" : "",
          espalda: entrenamientos.includes("Espalda") ? "X" : "",
          biceps: entrenamientos.includes("Biceps") ? "X" : "",
          pierna: entrenamientos.includes("Pierna") ? "X" : "",
          cardio: entrenamientos.includes("Cardio") ? "X" : ""
        };

        if (medicionExistente) {
          // Si ya existe, actualizarla
          update(ref(database, 'mediciones/' + medicionExistente), nuevaMedicion);
        } else {
          // Si no existe, agregarla nueva
          set(ref(database, 'mediciones/' + id), nuevaMedicion);
        }
      }).catch(error => {
        console.error('Error al verificar la medición:', error);
      });
    } else {
      console.log("No hay usuario autenticado.");
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

              // Marcar los checkboxes de entrenamiento si existen
              document.getElementById('entrenamientoPecho').checked = medicion.pecho === 'X';
              document.getElementById('entrenamientoHombro').checked = medicion.hombro === 'X';
              document.getElementById('entrenamientoTriceps').checked = medicion.triceps === 'X';
              document.getElementById('entrenamientoEspalda').checked = medicion.espalda === 'X';
              document.getElementById('entrenamientoBiceps').checked = medicion.biceps === 'X';
              document.getElementById('entrenamientoPierna').checked = medicion.pierna === 'X';
              document.getElementById('entrenamientoCardio').checked = medicion.cardio === 'X';

            } else {
              // Si no hay medición para esa fecha, aseguramos que los checkboxes estén desmarcados
              document.getElementById('gimnasio').checked = false;
              document.getElementById('batido').checked = false;
              document.getElementById('descanso').checked = false;

              // Desmarcar los checkboxes de entrenamiento
              document.getElementById('entrenamientoPecho').checked = false;
              document.getElementById('entrenamientoHombro').checked = false;
              document.getElementById('entrenamientoTriceps').checked = false;
              document.getElementById('entrenamientoEspalda').checked = false;
              document.getElementById('entrenamientoBiceps').checked = false;
              document.getElementById('entrenamientoPierna').checked = false;
              document.getElementById('entrenamientoCardio').checked = false;

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


// Evento para abrir el modal al marcar el checkbox de gimnasio
document.getElementById('gimnasio').addEventListener('click', function() {

      // Mostrar el modal de selección de entrenamiento
      var modal = new bootstrap.Modal(document.getElementById('modalEntrenamiento'));
      modal.show();
  
});

// Evento para guardar el entrenamiento seleccionado
document.getElementById('guardarEntrenamiento').addEventListener('click', function(event) {

    // Obtener los valores de los checkboxes seleccionados
    entrenamientos = [];
    if (document.getElementById('entrenamientoPecho').checked) entrenamientos.push('Pecho');
    if (document.getElementById('entrenamientoHombro').checked) entrenamientos.push('Hombro');
    if (document.getElementById('entrenamientoTriceps').checked) entrenamientos.push('Triceps');
    if (document.getElementById('entrenamientoEspalda').checked) entrenamientos.push('Espalda');
    if (document.getElementById('entrenamientoBiceps').checked) entrenamientos.push('Biceps');
    if (document.getElementById('entrenamientoPierna').checked) entrenamientos.push('Pierna');
    if (document.getElementById('entrenamientoCardio').checked) entrenamientos.push('Cardio');

    // Puedes hacer lo que desees con los tipos de entrenamiento seleccionados, como guardarlos en una variable o en la base de datos
    console.log(entrenamientos); // Solo para prueba, muestra los seleccionados

    // Cerrar el modal después de guardar
    var modal = bootstrap.Modal.getInstance(document.getElementById('modalEntrenamiento'));
    modal.hide();

    // Marcar el checkbox de gimnasio si se ha seleccionado algún entrenamiento
    document.getElementById('gimnasio').checked = entrenamientos.length > 0;

});

// Evento para al darle al botón de cerrar el modal de selección de entrenamiento cerrarEntrenamiento se cierre y se desmarquen los checkboxes de entrenamiento + el de gimnasio
document.getElementById('cerrarEntrenamiento').addEventListener('click', function() {
  // Cerrar el modal
  var modal = bootstrap.Modal.getInstance(document.getElementById('modalEntrenamiento'));
  modal.hide();

  // Desmarcar los checkboxes de entrenamiento
  document.getElementById('entrenamientoPecho').checked = false;
  document.getElementById('entrenamientoHombro').checked = false;
  document.getElementById('entrenamientoTriceps').checked = false;
  document.getElementById('entrenamientoEspalda').checked = false;
  document.getElementById('entrenamientoBiceps').checked = false;
  document.getElementById('entrenamientoPierna').checked = false;
  document.getElementById('entrenamientoCardio').checked = false;

  // Dejar el array de entrenamientos vacío
  entrenamientos = [];

  // Desmarcar el checkbox de gimnasio
  document.getElementById('gimnasio').checked = false;
});

// Si al cerrar el modal, hay algun checkbox de entrenamiento seleccionado, marcar el checkbox de gimnasio
document.getElementById('modalEntrenamiento').addEventListener('hidden.bs.modal', function() {
  // Verificar si al menos un checkbox de entrenamiento está marcado
  const entrenamientosSeleccionados = [
    document.getElementById('entrenamientoPecho').checked,
    document.getElementById('entrenamientoHombro').checked,
    document.getElementById('entrenamientoTriceps').checked,
    document.getElementById('entrenamientoEspalda').checked,
    document.getElementById('entrenamientoBiceps').checked,
    document.getElementById('entrenamientoPierna').checked,
    document.getElementById('entrenamientoCardio').checked
  ];

  // Si al menos uno está seleccionado, marcar el checkbox de gimnasio
  document.getElementById('gimnasio').checked = entrenamientosSeleccionados.includes(true);
});
