// ==========================================
// CONFIGURACIÓN DE THE DOG API
// ==========================================

const API_URL = "https://api.thedogapi.com/v1/breeds";

const API_KEY =
"live_xfEM7DbU4LaFLZ8pd8cnOXUZcUGOC9Lje1pu5vFJvLRoxVtNcD01Xy28E4XSPXsM";


// ==========================================
// ELEMENTOS HTML
// ==========================================

const sizeFilter =
    document.getElementById("sizeFilter");

const temperamentFilter =
    document.getElementById("temperamentFilter");

const btnSearch =
    document.getElementById("btnSearch");

const btnAll =
    document.getElementById("btnAll");

const resultsGrid =
    document.getElementById("resultsGrid");

const resultsCount =
    document.getElementById("resultsCount");

const statusContainer =
    document.getElementById("statusContainer");

const statusMessage =
    document.getElementById("statusMessage");


// Modal

const dogModal =
    document.getElementById("dogModal");

const modalImage =
    document.getElementById("modalImage");

const modalTitle =
    document.getElementById("modalTitle");

const modalInformation =
    document.getElementById("modalInformation");

const closeModalBtn =
    document.getElementById("closeModalBtn");


// ==========================================
// VARIABLES
// ==========================================

let allDogs = [];


// ==========================================
// CONSULTAR API
// ==========================================

async function cargarPerros() {

    mostrarCargando(
        true,
        "🐶 Cargando catálogo de perros..."
    );

    try {

        const response = await fetch(API_URL, {

            headers: {

                "x-api-key": API_KEY

            }

        });


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        const data = await response.json();


        allDogs = data;


        mostrarPerros(allDogs);


    } catch (error) {

        console.error(error);

        resultsGrid.innerHTML = `

            <div class="error">

                <h3>
                    ❌ Error al consultar la API
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

        resultsCount.textContent =
            "Error";


    } finally {

        mostrarCargando(false);

    }

}


// ==========================================
// MOSTRAR PERROS
// ==========================================

function mostrarPerros(perros) {

    resultsGrid.innerHTML = "";


    resultsCount.textContent =
        `${perros.length} perros encontrados`;


    if (perros.length === 0) {

        resultsGrid.innerHTML = `

            <div>

                <h3>
                    😢 No se encontraron perros
                </h3>

                <p>
                    Prueba con otro tamaño o temperamento.
                </p>

            </div>

        `;

        return;

    }


    perros.forEach((dog, index) => {

        crearTarjeta(dog, index);

    });

}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjeta(dog, index) {

    const card =
        document.createElement("article");

    card.className =
        "card-item";


    let imagen =
        "https://via.placeholder.com/500x300?text=Sin+imagen";


    if (dog.image && dog.image.url) {

        imagen =
            dog.image.url;

    }


    let temperament =
        dog.temperament ||
        "No especificado";


    let peso =
        "No disponible";


    if (dog.weight && dog.weight.metric) {

        peso =
            dog.weight.metric + " kg";

    }


    let altura =
        "No disponible";


    if (dog.height && dog.height.metric) {

        altura =
            dog.height.metric + " cm";

    }


    card.innerHTML = `

        <div class="card-image-box">

            <img
                src="${imagen}"
                alt="${dog.name}"
                loading="lazy"
            >

        </div>


        <div class="card-body">

            <h3 class="card-title">

                🐶 ${dog.name}

            </h3>


            <p class="card-info">

                📏 <strong>Peso:</strong>
                ${peso}

            </p>


            <p class="card-info">

                📐 <strong>Altura:</strong>
                ${altura}

            </p>


            <p class="card-temperament">

                ❤️ <strong>Temperamento:</strong><br>

                ${temperament}

            </p>


            <button
                class="btn-detail"
                onclick="mostrarDetalle(${index})">

                Ver detalles

            </button>

        </div>

    `;


    resultsGrid.appendChild(card);

}


// ==========================================
// FILTRAR PERROS
// ==========================================

function filtrarPerros() {

    const tamaño =
        sizeFilter.value;

    const temperamento =
        temperamentFilter.value;


    let resultado =
        [...allDogs];


    // FILTRO POR TAMAÑO

    if (tamaño !== "todos") {

        resultado =
            resultado.filter(
                dog =>
                    clasificarTamaño(dog)
                    === tamaño
            );

    }


    // FILTRO POR TEMPERAMENTO

    if (temperamento !== "todos") {

        resultado =
            resultado.filter(
                dog =>
                    tieneTemperamento(
                        dog,
                        temperamento
                    )
            );

    }


    mostrarPerros(resultado);

}


// ==========================================
// CLASIFICAR TAMAÑO
// ==========================================

function clasificarTamaño(dog) {

    if (!dog.height ||
        !dog.height.metric) {

        return "mediano";

    }


    const alturaTexto =
        dog.height.metric;


    const altura =
        parseFloat(
            alturaTexto.split(" - ")[1]
            || alturaTexto
        );


    if (altura <= 30) {

        return "pequeño";

    }


    if (altura <= 60) {

        return "mediano";

    }


    return "grande";

}


// ==========================================
// BUSCAR TEMPERAMENTO
// ==========================================

function tieneTemperamento(
    dog,
    temperamento
) {

    if (!dog.temperament) {

        return false;

    }


    const texto =
        dog.temperament.toLowerCase();


    const palabras = {

        affectionate: [
            "affectionate",
            "loving",
            "affection"
        ],

        friendly: [
            "friendly",
            "amiable",
            "sociable"
        ],

        active: [
            "active",
            "energetic"
        ],

        agile: [
            "agile"
        ],

        intelligent: [
            "intelligent",
            "smart"
        ],

        playful: [
            "playful",
            "fun-loving"
        ],

        loyal: [
            "loyal",
            "devoted"
        ],

        protective: [
            "protective"
        ],

        calm: [
            "calm",
            "easygoing"
        ],

        independent: [
            "independent"
        ]

    };


    const palabrasBuscar =
        palabras[temperamento];


    if (!palabrasBuscar) {

        return false;

    }


    return palabrasBuscar.some(
        palabra =>
            texto.includes(palabra)
    );

}


// ==========================================
// MOSTRAR DETALLE
// ==========================================

function mostrarDetalle(index) {

    const perrosVisibles =
        obtenerPerrosFiltrados();


    const dog =
        perrosVisibles[index];


    if (!dog) {

        return;

    }


    const imagen =
        dog.image
            ? dog.image.url
            : "";


    modalImage.src =
        imagen;


    modalImage.alt =
        dog.name;


    modalTitle.textContent =
        dog.name;


    const peso =
        dog.weight?.metric
            || "No disponible";


    const altura =
        dog.height?.metric
            || "No disponible";


    const vida =
        dog.life_span
            || "No disponible";


    const temperamento =
        dog.temperament
            || "No especificado";


    modalInformation.innerHTML = `

        <p>
            <strong>🐶 Raza:</strong>
            ${dog.name}
        </p>

        <p>
            <strong>📏 Peso:</strong>
            ${peso} kg
        </p>

        <p>
            <strong>📐 Altura:</strong>
            ${altura} cm
        </p>

        <p>
            <strong>❤️ Temperamento:</strong>
            ${temperamento}
        </p>

        <p>
            <strong>🎂 Esperanza de vida:</strong>
            ${vida}
        </p>

        <p>
            <strong>📌 Grupo:</strong>
            ${dog.breed_group || "No especificado"}
        </p>

    `;


    dogModal.showModal();

}


// ==========================================
// OBTENER PERROS FILTRADOS
// ==========================================

function obtenerPerrosFiltrados() {

    const tamaño =
        sizeFilter.value;

    const temperamento =
        temperamentFilter.value;


    let resultado =
        [...allDogs];


    if (tamaño !== "todos") {

        resultado =
            resultado.filter(
                dog =>
                    clasificarTamaño(dog)
                    === tamaño
            );

    }


    if (temperamento !== "todos") {

        resultado =
            resultado.filter(
                dog =>
                    tieneTemperamento(
                        dog,
                        temperamento
                    )
            );

    }


    return resultado;

}


// ==========================================
// MOSTRAR CARGANDO
// ==========================================

function mostrarCargando(
    cargando,
    mensaje = ""
) {

    if (cargando) {

        statusContainer.style.display =
            "block";

        statusMessage.textContent =
            mensaje;

    } else {

        statusContainer.style.display =
            "none";

    }

}


// ==========================================
// EVENTOS
// ==========================================

btnSearch.addEventListener(
    "click",
    filtrarPerros
);


btnAll.addEventListener(
    "click",
    () => {

        sizeFilter.value =
            "todos";

        temperamentFilter.value =
            "todos";

        mostrarPerros(allDogs);

    }
);


closeModalBtn.addEventListener(
    "click",
    () => {

        dogModal.close();

    }
);


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarPerros();

    }
);