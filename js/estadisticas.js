// Importar Firebase (Asegurar que usas las versiones correctas)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
        // De primeras vienen undefined, si es así, cogemos el año y mes actual
        if (!year) {
            year = new Date().getFullYear();
        }

        if (!month) {
            month = new Date().getMonth() + 1;

            // Para el mes, si es menor a 10, le añadimos un 0 delante y lo convertimos a string
            document.getElementById("filterMonth").value = month < 10 ? "0" + month.toString() : month.toString();
        }

        const dbRef = ref(db, "mediciones");
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            console.log("No hay datos para este usuario.");
            Swal.fire("Sin datos", "No se encontraron estadísticas registradas.", "info");
            return;
        }

        const datos = snapshot.val(); // Obtener todos los registros
        let datosUsuario = { gimnasio: 0, batido: 0, descanso: 0 };

        Object.values(datos).forEach((data) => {
            console.log(data);
            if (data.email === email) {
                // Filtrar por año y mes (usando la fecha "yyyy-mm-dd")
                const [dbYear, dbMonth ,day ] = data.fecha.split("-");
                console.log(month);
                // Si el mes es '00', es que queremos la info de todo el año
                if (parseInt(dbYear) === parseInt(year) && parseInt(month) === 0) {
                    if (data.gimnasio === "X") datosUsuario.gimnasio++;
                    if (data.batido === "X") datosUsuario.batido++;
                    if (data.descanso === "X") datosUsuario.descanso++;
                }

                if (parseInt(dbYear) === parseInt(year) && parseInt(dbMonth) === parseInt(month)) {
                    if (data.gimnasio === "X") datosUsuario.gimnasio++;
                    if (data.batido === "X") datosUsuario.batido++;
                    if (data.descanso === "X") datosUsuario.descanso++;
                }
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


// Función para generar el gráfico personal con tamaño adecuado y sin problemas visuales
function generarGraficoPersonal(datos) {
    // Verificar si ya existe un gráfico y destruirlo antes de crear uno nuevo
    const oldCanvas = document.getElementById("graficoPersonal");
    if (oldCanvas) {
        oldCanvas.remove(); // Eliminar el canvas anterior
    }

    // Crear un nuevo canvas para el gráfico con tamaño fijo
    const container = document.getElementById("pills-home");
    const canvas = document.createElement("canvas");
    canvas.id = "graficoPersonal";
    canvas.style.maxWidth = "400px"; // Ancho máximo
    canvas.style.maxHeight = "300px"; // Altura máxima
    canvas.style.margin = "0 auto"; // Centrar el gráfico

    container.appendChild(canvas);

    // Obtener el contexto del canvas
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Gimnasio", "Batido", "Descanso"],
            datasets: [{
                label: "Frecuencia de actividad",
                data: [datos.gimnasio, datos.batido, datos.descanso],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.7)", // Rojo semi-transparente
                    "rgba(54, 162, 235, 0.7)", // Azul semi-transparente
                    "rgba(255, 206, 86, 0.7)"  // Amarillo semi-transparente
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)"
                ],
                borderWidth: 2, // Bordes de las barras
                borderRadius: 8, // Bordes redondeados
                barPercentage: 0.5, // Tamaño de las barras
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800, // Animación más fluida
                easing: "easeOutQuad" // Efecto de animación suave
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
                    suggestedMax: Math.max(datos.gimnasio, datos.batido, datos.descanso) + 1, // Ajusta la escala sin que se vea muy grande
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


// Al darle al logo quiero que me lleve a la página de inicio.html
document.getElementById("logo").addEventListener("click", () => {
    location.href = "./inicio.html";
}); 