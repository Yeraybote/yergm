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

// Activar el fondo borroso
document.getElementById("pills-personales").classList.add("loading");

// Esperar a que el usuario inicie sesión
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("loading").style.display = "block";
        // console.log("Usuario logueado:", user.email);
        email = user.email;

        // Obtener el UUID del usuario
        const userQuery = query(ref(db, "usuarios"), orderByChild("email"), equalTo(email));
        const userSnapshot = await get(userQuery);
        userUuid = Object.keys(userSnapshot.val())[0];

        cargarEstadisticas(user.email);
        cargarAmigos(userUuid);

        // Ocultar el indicador de carga en caso de error
        document.getElementById("loading").style.display = "none";
        // Eliminar el fondo borroso
        document.getElementById("pills-personales").classList.remove("loading");
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
document.getElementById("filterMonthAmigos").value = month < 10 ? "0" + month.toString() : month.toString();
document.getElementById("yearPickerAmigos").value = year;

// Configuración del datepicker para seleccionar el año
$(document).ready(function() {
    $('#yearPicker').datepicker({
        format: "yyyy",          // Solo muestra el año
        viewMode: "years",       // Modo solo años
        minViewMode: "years",    // Solo se puede seleccionar años
        autoclose: true          // Cierra automáticamente el datepicker después de seleccionar el año       
    });
});

// Configuración del datepicker para seleccionar el año para los amigos
$(document).ready(function() {
    $('#yearPickerAmigos').datepicker({
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

                // Si entrenoCardio es X, sumamos kmRecorridos y minutosCardio
                if (data.entrenoCardio === "X") {
                    datosUsuario.kmRecorridos = (datosUsuario.kmRecorridos || 0) + parseInt(data.kmRecorridos);
                    datosUsuario.minutosCardio = (datosUsuario.minutosCardio || 0) + parseInt(data.minutosCardio);
                } 
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

                // Si entrenoCardio es X, sumamos kmRecorridos y minutosCardio
                if (data.entrenoCardio === "X") {
                    datosUsuario.kmRecorridos = (datosUsuario.kmRecorridos || 0) + parseInt(data.kmRecorridos);
                    datosUsuario.minutosCardio = (datosUsuario.minutosCardio || 0) + parseInt(data.minutosCardio);
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

// Escuchar el evento 'changeDate' cuando el año cambia para los amigos
$('#yearPickerAmigos').on('changeDate', function(e) {
    // Obtener el año seleccionado
    const year = e.format('yyyy');
    
    // Obtener el mes seleccionado
    const month = document.getElementById("filterMonthAmigos").value;

    let selectAmigos = document.getElementById("filterFriend");
    const friendUuid = selectAmigos.value;
    
    // Llamar a la función cargarEstadisticas con el año y mes seleccionados
    cargarEstadisticasAmigo(friendUuid, year, month);
    
});

// Al cambiar el mes seleccionado quiero que se muestren las estadísticas de ese mes y año para los amigos
document.getElementById("filterMonthAmigos").addEventListener("change", (e) => {
    // Obtener el mes del select seleccionado
    const month = e.target.value;
    
    // Obtener el año seleccionado
    const year = document.getElementById("yearPickerAmigos").value;

    let selectAmigos = document.getElementById("filterFriend");
    const friendUuid = selectAmigos.value;

    // Llamar a la función cargarEstadisticas con el año y mes seleccionados
    cargarEstadisticasAmigo(friendUuid, year, month);
});

// Al cambiar el amigo seleccionado quiero que se muestren las estadísticas de ese amigo
document.getElementById("filterFriend").addEventListener("change", (e) => {
    // Obtener el UUID del amigo seleccionado
    const friendUuid = e.target.value;

    const year = document.getElementById("yearPickerAmigos").value;

    // Obtener el mes seleccionado
    const month = document.getElementById("filterMonthAmigos").value;

    cargarEstadisticasAmigo(friendUuid, year, month);
});


function generarGraficoPersonal(datos) {


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

    // Mostramos los km recorridos y minutos de cardio si los hay
    if (datos.kmRecorridos && datos.minutosCardio) {
        const kmRecorridos = datos.kmRecorridos;
        const minutosCardio = datos.minutosCardio;
        
        // Actualizar en la interfaz
        document.getElementById("totalKm").textContent = `${kmRecorridos} km`;
        document.getElementById("totalMinutos").textContent = `${minutosCardio} min`;

    }
    
}


/* async function cargarRankingGlobal() {
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
} */

// Llamar a la función cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
    cargarRankingGlobal();
});



// Al darle al logo quiero que me lleve a la página de inicio.html
document.getElementById("logo").addEventListener("click", () => {
    location.href = "./inicio.html";
}); 

async function cargarAmigos(userUuid) {
    try {
        const amigosRef = ref(db, `amigos/${userUuid}`);
        const amigosSnapshot = await get(amigosRef);

        if (amigosSnapshot.exists()) {
            const amigosData = amigosSnapshot.val();
            const selectAmigos = document.getElementById("filterFriend");
            
            // Iterar sobre los amigos y obtener sus nombres
            for (let amigoId in amigosData) {
                // Hacer una consulta para obtener el nombre de cada amigo
                const amigoRef = ref(db, `usuarios/${amigoId}`); // Suponiendo que los usuarios están en la ruta "usuarios"
                const amigoSnapshot = await get(amigoRef);
    
                if (amigoSnapshot.exists()) {
                    const amigoData = amigoSnapshot.val();
                    const amigoNombre = amigoData.nombre || "Nombre desconocido"; // Usar el nombre si existe, de lo contrario "Nombre desconocido"
    
                    // Crear un nuevo elemento del select con el nombre del amigo
                    const option = document.createElement("option");
                    option.value = amigoId;
                    option.textContent = amigoNombre;

                    selectAmigos.appendChild(option);
                }
            }


        } else {
            console.log("No hay amigos registrados.");
            //Swal.fire("Sin amigos", "No tienes amigos registrados.", "info");

            // Limpiar el gráfico si no hay amigos
            const oldCanvas = document.getElementById("graficoAmigos");

            // Limpiamos el canvas, sin eliminarlo
            const ctx = oldCanvas.getContext("2d");

            ctx.clearRect(0, 0, oldCanvas.width, oldCanvas.height);

            return;
        }

        // Cargar las estadísticas del amigo seleccionado
        let selectAmigos = document.getElementById("filterFriend");
        const friendUuid = selectAmigos.value;
        //cargarEstadisticasAmigo(friendUuid);

    } catch (error) {
        console.error("Error al cargar amigos:", error);
        Swal.fire("Error", "No se pudieron cargar los amigos.", "error");
    }
};

// Función para obtener estadísticas de un amigo
async function cargarEstadisticasAmigo(friendUuid, year, month) {

    if (!friendUuid) {
        console.error("No se proporcionó el UUID del amigo.");
        return;
    }

    try {
        // Sacamos el mail del amigo
        const dbRef1 = ref(db, `usuarios/${friendUuid}`);
        const snapshot1 = await get(dbRef1);
        let mailAmigo = snapshot1.val().email;

        // Si no se recibe el año o mes, usamos los valores actuales
        if (!year) year = new Date().getFullYear();
        if (!month) {
            month = new Date().getMonth() + 1;
            document.getElementById("filterMonthAmigos").value = month < 10 ? "0" + month.toString() : month.toString();
        }

        // Hacemos la consulta a Firebase filtrando por el UUID del amigo
        const dbRef = query(ref(db, "mediciones"), orderByChild("email"), equalTo(mailAmigo));
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            //Swal.fire("Sin datos", "No se encontraron estadísticas registradas.", "info");

            // Limpiar el gráfico si no hay datos
            const oldCanvas = document.getElementById("graficoAmigos");
            
            // Limpiamos el canvas, sin eliminarlo
            const ctx = oldCanvas.getContext("2d");

            ctx.clearRect(0, 0, oldCanvas.width, oldCanvas.height);

            generarGraficoAmigo({ gimnasio: 0, batido: 0, descanso: 0, biceps: 0, triceps: 0, espalda: 0, pecho: 0, pierna: 0, hombro: 0, cardio: 0, horasDescanso: 0 });

            return;
        }

        const datos = snapshot.val();
        let datosAmigo = { gimnasio: 0, batido: 0, descanso: 0, biceps: 0, triceps: 0, espalda: 0, pecho: 0, pierna: 0, hombro: 0, cardio: 0, horasDescanso: 0 };

        Object.values(datos).forEach((data) => {

            // Convertimos la fecha de "yyyy-mm-dd"
            const [dbYear, dbMonth, day] = data.fecha.split("-");

            // Si el mes es '00', queremos la info de todo el año
            if (parseInt(dbYear) === parseInt(year) && parseInt(month) === 0) {
                if (data.gimnasio === "X") datosAmigo.gimnasio++;
                if (data.batido === "X") datosAmigo.batido++;
                if (data.descanso === "X") datosAmigo.descanso++;

                if (data.biceps === "X") datosAmigo.biceps++;
                if (data.triceps === "X") datosAmigo.triceps++;
                if (data.espalda === "X") datosAmigo.espalda++;
                if (data.pecho === "X") datosAmigo.pecho++;
                if (data.pierna === "X") datosAmigo.pierna++;
                if (data.hombro === "X") datosAmigo.hombro++;
                if (data.cardio === "X") datosAmigo.cardio++;

                if (data.descanso === "X") datosAmigo.horasDescanso += parseInt(data.horasDescanso);
            }

            if (parseInt(dbYear) === parseInt(year) && parseInt(dbMonth) === parseInt(month)) {
                if (data.gimnasio === "X") datosAmigo.gimnasio++;
                if (data.batido === "X") datosAmigo.batido++;
                if (data.descanso === "X") datosAmigo.descanso++;

                if (data.biceps === "X") datosAmigo.biceps++;
                if (data.triceps === "X") datosAmigo.triceps++;
                if (data.espalda === "X") datosAmigo.espalda++;
                if (data.pecho === "X") datosAmigo.pecho++;
                if (data.pierna === "X") datosAmigo.pierna++;
                if (data.hombro === "X") datosAmigo.hombro++;
                if (data.cardio === "X") datosAmigo.cardio++;

                if (data.descanso === "X") datosAmigo.horasDescanso += parseInt(data.horasDescanso);
            }

        });

        // Generar el gráfico personal con los datos del usuario
        generarGraficoAmigo(datosAmigo);

    }
    catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        Swal.fire("Error", "No se pudieron cargar los datos.", "error");
    }
};

// Función para generar gráfico de estadísticas de un amigo	
function generarGraficoAmigo(datos) {
    //console.log("Datos del usuario:", datos);

    // Verificar si ya existe un gráfico y destruirlo antes de crear uno nuevo
    const oldCanvas = document.getElementById("graficoAmigos");
    if (oldCanvas) {
        oldCanvas.remove(); // Eliminar el canvas anterior
    }

    // Crear un nuevo canvas para el gráfico con tamaño fijo
    const container = document.getElementById("pills-amigos");
    const canvas = document.createElement("canvas");
    canvas.id = "graficoAmigos";
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
                        datos.pierna, datos.hombro
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

};

document.getElementById("pills-amigos-tab").addEventListener("click", () => {
    setTimeout(() => {
        let selectAmigos = document.getElementById("filterFriend");
        const friendUuid = selectAmigos.value;
        cargarEstadisticasAmigo(friendUuid);
        //generarGraficoAmigo(datos);
    }, 100); // Ajusta el tiempo si es necesario
});

