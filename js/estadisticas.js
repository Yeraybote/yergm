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

// Esperar a que el usuario inicie sesión
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // console.log("Usuario logueado:", user.email);
        email = user.email;
        cargarEstadisticas(user.email);
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

// De primeras metemos el año actual en el datepicker y el mes actual en el select
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;

// Para el mes, si es menor a 10, le añadimos un 0 delante y lo convertimos a string
document.getElementById("filterMonth").value = month < 10 ? "0" + month.toString() : month.toString();
document.getElementById("yearPicker").value = year;


// Configuración del datepicker para seleccionar el año
$(document).ready(function() {
    $('#yearPicker').datepicker({
        format: "yyyy",          // Solo muestra el año
        viewMode: "years",       // Modo solo años
        minViewMode: "years",    // Solo se puede seleccionar años
        autoclose: true          // Cierra automáticamente el datepicker después de seleccionar el año       
    });
});

// Función para obtener estadísticas del usuario autenticado
async function cargarEstadisticas(email, year, month) {
    try {
        // Si no se recibe el año o mes, usamos los valores actuales
        if (!year) year = new Date().getFullYear();
        if (!month) {
            month = new Date().getMonth() + 1;
            document.getElementById("filterMonth").value = month < 10 ? "0" + month.toString() : month.toString();
        }

        // Hacemos la consulta a Firebase filtrando por el email
        const dbRef = query(ref(db, "mediciones"), orderByChild("email"), equalTo(email));
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            console.log("No hay datos para este usuario.");
            Swal.fire("Sin datos", "No se encontraron estadísticas registradas.", "info");
            return;
        }

        const datos = snapshot.val();
        let datosUsuario = { gimnasio: 0, batido: 0, descanso: 0, biceps: 0, triceps: 0, espalda: 0, pecho: 0, pierna: 0, hombro: 0, cardio: 0, horasDescanso: 0 };

        Object.values(datos).forEach((data) => {

            // Convertimos la fecha de "yyyy-mm-dd"
            const [dbYear, dbMonth, day] = data.fecha.split("-");

            // Si el mes es '00', queremos la info de todo el año
            if (parseInt(dbYear) === parseInt(year) && parseInt(month) === 0) {
                if (data.gimnasio === "X") datosUsuario.gimnasio++;
                if (data.batido === "X") datosUsuario.batido++;
                if (data.descanso === "X") datosUsuario.descanso++;

                if (data.biceps === "X") datosUsuario.biceps++;
                if (data.triceps === "X") datosUsuario.triceps++;
                if (data.espalda === "X") datosUsuario.espalda++;
                if (data.pecho === "X") datosUsuario.pecho++;
                if (data.pierna === "X") datosUsuario.pierna++;
                if (data.hombro === "X") datosUsuario.hombro++;
                if (data.cardio === "X") datosUsuario.cardio++;

                if (data.descanso === "X") datosUsuario.horasDescanso += parseInt(data.horasDescanso);
            }

            if (parseInt(dbYear) === parseInt(year) && parseInt(dbMonth) === parseInt(month)) {
                if (data.gimnasio === "X") datosUsuario.gimnasio++;
                if (data.batido === "X") datosUsuario.batido++;
                if (data.descanso === "X") datosUsuario.descanso++;

                if (data.biceps === "X") datosUsuario.biceps++;
                if (data.triceps === "X") datosUsuario.triceps++;
                if (data.espalda === "X") datosUsuario.espalda++;
                if (data.pecho === "X") datosUsuario.pecho++;
                if (data.pierna === "X") datosUsuario.pierna++;
                if (data.hombro === "X") datosUsuario.hombro++;
                if (data.cardio === "X") datosUsuario.cardio++;

                if (data.descanso === "X") datosUsuario.horasDescanso += parseInt(data.horasDescanso);
            }
        });

        // Generar el gráfico personal con los datos del usuario
        generarGraficoPersonal(datosUsuario);

    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        Swal.fire("Error", "No se pudieron cargar los datos.", "error");
    }
}

// Escuchar el evento 'changeDate' cuando el año cambia
$('#yearPicker').on('changeDate', function(e) {
    // Obtener el año seleccionado
    const year = e.format('yyyy');
    
    // Obtener el mes seleccionado
    const month = document.getElementById("filterMonth").value;

    // Llamar a la función cargarEstadisticas con el año y mes seleccionados
    cargarEstadisticas(email, year, month);
});

// Al cambiar el mes seleccionado quiero que se muestren las estadísticas de ese mes y año
document.getElementById("filterMonth").addEventListener("change", (e) => {
    // Obtener el mes del select seleccionado
    const month = e.target.value;
    
    // Obtener el año seleccionado
    const year = document.getElementById("yearPicker").value;

    // Llamar a la función cargarEstadisticas con el año y mes seleccionados
    cargarEstadisticas(email, year, month);
});


function generarGraficoPersonal(datos) {
    console.log("Datos del usuario:", datos);

    // Verificar si ya existe un gráfico y destruirlo antes de crear uno nuevo
    const oldCanvas = document.getElementById("graficoPersonal");
    if (oldCanvas) {
        oldCanvas.remove(); // Eliminar el canvas anterior
    }

    // Crear un nuevo canvas para el gráfico con tamaño fijo
    const container = document.getElementById("pills-personales");
    const canvas = document.createElement("canvas");
    canvas.id = "graficoPersonal";
    canvas.style.maxWidth = "500px"; // Ajustar el tamaño
    canvas.style.maxHeight = "350px";
    canvas.style.margin = "0 auto";

    container.appendChild(canvas);

    // Obtener el contexto del canvas
    const ctx = canvas.getContext("2d");

    // Calcular la media de horas de descanso
    let mediaHorasDescanso = datos.descanso > 0 ? (datos.horasDescanso / datos.descanso).toFixed(1) : 0;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Bíceps", "Tríceps", "Espalda", "Pecho", "Pierna", "Hombro", "Cardio"],
            datasets: [{
                label: "Frecuencia de entrenamiento",
                data: [
                    datos.biceps, datos.triceps, datos.espalda, datos.pecho,
                    datos.pierna, datos.hombro, datos.cardio
                ],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.7)", // Verde agua
                    "rgba(153, 102, 255, 0.7)", // Morado
                    "rgba(255, 159, 64, 0.7)", // Naranja
                    "rgba(199, 199, 199, 0.7)", // Gris
                    "rgba(255, 99, 255, 0.7)", // Rosa
                    "rgba(0, 255, 127, 0.7)", // Verde
                    "rgba(0, 191, 255, 0.7)"  // Azul claro
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(199, 199, 199, 1)",
                    "rgba(255, 99, 255, 1)",
                    "rgba(0, 255, 127, 1)",
                    "rgba(0, 191, 255, 1)"
                ],
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.5,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: "easeOutQuad"
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: { size: 14 },
                        color: "#fff"
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    bodySpacing: 5,
                    padding: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(
                        datos.biceps, datos.triceps, datos.espalda, datos.pecho,
                        datos.pierna, datos.hombro, datos.cardio
                    ) + 1,
                    grid: { color: "rgba(255, 255, 255, 0.2)" },
                    ticks: {
                        font: { size: 12 },
                        color: "#fff",
                        stepSize: 1
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 12 },
                        color: "#fff"
                    }
                }
            }
        }
    });
    
}


async function cargarRankingGlobal() {
    try {
        const dbRef = ref(db, "mediciones");
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            console.log("No hay datos disponibles.");
            Swal.fire("Sin datos", "No hay estadísticas globales.", "info");
            return;
        }

        const datos = snapshot.val();
        let ranking = {};

        // Obtener el año y mes actual
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        // Recorrer los datos y contar entrenamientos por usuario
        Object.values(datos).forEach((data) => {
            if (data.gimnasio === "X") {
                ranking[data.email] = (ranking[data.email] || 0) + 1;
            }
        });

        // Convertir el ranking a un array y ordenarlo por entrenamientos
        let rankingArray = Object.entries(ranking).map(([email, entrenamientos]) => ({ email, entrenamientos }));
        rankingArray.sort((a, b) => b.entrenamientos - a.entrenamientos); // Orden descendente

        // Mostrar los datos en la tabla
        let tbody = document.getElementById("rankingTable");
        tbody.innerHTML = ""; // Limpiar tabla antes de actualizar

        rankingArray.forEach((user, index) => {
            let row = `<tr>
                <td>${index + 1} 🏅</td>
                <td>${user.email}</td>
                <td>${user.entrenamientos}</td>
            </tr>`;
            tbody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error al cargar el ranking:", error);
        Swal.fire("Error", "No se pudo cargar el ranking.", "error");
    }
}

// Llamar a la función cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
    cargarRankingGlobal();
});



// Al darle al logo quiero que me lleve a la página de inicio.html
document.getElementById("logo").addEventListener("click", () => {
    location.href = "./inicio.html";
}); 