
/**
 * =============================================================================
 * SCRIPT: js/app.js
 * CONSULTA DE IMAGENES DE LA NASA - JAVASCRIPT NATIVO -
 * Copyright (c) [2025] [René Peña Martínez]. Licensed under CC BY 4.0.
 * Full license text available at https://creativecommons.org
 * =============================================================================
 * 
 * GUIA TECNICA :
 * 1. Manipulacion de elementos del DOM mediante document.getElementById.
 * 2. Manejo de eventos (submit, input, click).
 * 3. Consumo del servicio web con la API nativa fetch() y async / await.
 * 4. Control de excepciones mediante bloques try / catch / finally.
 * 5. Procesamiento de la estructura de datos JSON provista por la NASA.
 * 6. Generacion dinamica de nodos HTML con escape de seguridad.
 * =============================================================================
 */

// 1. Configuracion del servicio REST oficial
const NASA_BASE_URL = 'https://images-api.nasa.gov/search';

// 2. Referencias a los elementos de la interfaz de usuario
const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const queryPreviewText = document.getElementById('queryPreviewText');
const apiEndpointUrl = document.getElementById('apiEndpointUrl');
const statusContainer = document.getElementById('statusContainer');
const statusMessage = document.getElementById('statusMessage');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const quickOptions = document.getElementById('quickOptions');

// Elementos de la ventana modal
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const closeModalBtn = document.getElementById('closeModalBtn');

// Variable en memoria con los registros descargados
let currentResults = [];

/**
 * Actualiza la confirmacion en pantalla del termino que se procesara
 */
function actualizarVistaPreviaQuery(query) {
  const cleanQuery = query.trim() || 'planets';
  queryPreviewText.textContent = `"${cleanQuery}"`;

  // Construccion del endpoint para fines pedagogicos
  const encodedQuery = encodeURIComponent(cleanQuery);
  const fullUrl = `${NASA_BASE_URL}?q=${encodedQuery}&media_type=image`;
  apiEndpointUrl.textContent = fullUrl;
}

/**
 * Realiza la solicitud HTTP GET asincrona al servicio de la NASA
 * @param {string} searchKeyword - Criterio de busqueda
 */
async function consultarNasaApi(searchKeyword) {
  const query = searchKeyword.trim();
  if (!query) {
    alert('Ingrese un termino valido antes de realizar la consulta.');
    return;
  }

  // Notificar al usuario el inicio de la solicitud
  mostrarCargando(true, `Consultando servidores de la NASA para "${query}"...`);
  resultsGrid.innerHTML = '';
  resultsCount.textContent = 'Buscando...';

  const endpoint = `${NASA_BASE_URL}?q=${encodeURIComponent(query)}&media_type=image`;

  try {
    // Llamada HTTP con fetch() sin bloquear el hilo principal
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Respuesta del servidor: HTTP ${response.status} (${response.statusText})`);
    }

    // Conversion a objeto JavaScript
    const json = await response.json();
    const items = json.collection?.items || [];
    currentResults = items;

    // Renderizar resultados en la pagina
    mostrarResultados(items, query);

  } catch (error) {
    console.error('Error en la peticion HTTP:', error);
    mostrarError(`Error al consultar la API: ${error.message}. Compruebe la conexion de red.`);
  } finally {
    mostrarCargando(false);
  }
}

/**
 * Inserta las tarjetas de imagenes en el contenedor de resultados
 */
function mostrarResultados(items, query) {
  resultsGrid.innerHTML = '';
  resultsCount.textContent = `${items.length} imagenes encontradas`;

  if (items.length === 0) {
    resultsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #4b5563; background: #f9fafb; border: 1px solid #e5e7eb;">
        <p><strong>No se encontraron registros para "${query}"</strong></p>
        <p style="margin-top: 6px; font-size: 13px;">Sugerencia: Ingrese terminos en ingles como Jupiter, Saturn, Mars, Hubble o Apollo.</p>
      </div>
    `;
    return;
  }

  items.slice(0, 36).forEach((item, index) => {
    const data = item.data && item.data[0] ? item.data[0] : {};
    const title = data.title || 'Registro de la NASA';
    const description = data.description || 'Sin descripcion provista en el archivo oficial.';
    const dateCreated = data.date_created ? new Date(data.date_created).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'Fecha no especificada';
    const nasaId = data.nasa_id || 'N/A';

    const previewLink = item.links && item.links[0] ? item.links[0].href : null;
    if (!previewLink) return;

    const card = document.createElement('article');
    card.className = 'card-item';
    card.innerHTML = `
      <div class="card-image-box">
        <img 
          src="${previewLink}" 
          alt="${escaparHtml(title)}" 
          loading="lazy" 
          onclick="abrirModal(${index})"
        >
        <span class="card-id-tag">${nasaId}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escaparHtml(title)}</h3>
        <div class="card-date">Fecha: ${dateCreated}</div>
        <p class="card-description">${escaparHtml(description)}</p>
        <div class="card-footer">
          <button type="button" class="btn-detail" onclick="abrirModal(${index})">
            Ver detalle completo
          </button>
        </div>
      </div>
    `;

    resultsGrid.appendChild(card);
  });
}

/**
 * Abre el dialogo con la miniatura y descripcion completa
 */
function abrirModal(index) {
  const item = currentResults[index];
  if (!item) return;

  const data = item.data && item.data[0] ? item.data[0] : {};
  const previewLink = item.links && item.links[0] ? item.links[0].href : '';

  modalTitle.textContent = data.title || 'Detalle del registro';
  modalDescription.textContent = data.description || 'Sin descripcion disponible.';
  modalImage.src = previewLink;
  modalImage.alt = data.title || 'Vista previa';

  if (typeof imageModal.showModal === 'function') {
    imageModal.showModal();
  } else {
    imageModal.setAttribute('open', 'true');
  }
}

closeModalBtn.addEventListener('click', () => {
  if (typeof imageModal.close === 'function') {
    imageModal.close();
  } else {
    imageModal.removeAttribute('open');
  }
});

// Eventos del formulario y controles
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  consultarNasaApi(queryInput.value);
});

queryInput.addEventListener('input', () => {
  actualizarVistaPreviaQuery(queryInput.value);
});

quickOptions.addEventListener('click', (event) => {
  const button = event.target.closest('.btn-category');
  if (!button) return;

  document.querySelectorAll('.btn-category').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');

  const selectedQuery = button.getAttribute('data-query');
  queryInput.value = selectedQuery;
  actualizarVistaPreviaQuery(selectedQuery);
  consultarNasaApi(selectedQuery);
});

// Utilidades
function mostrarCargando(isLoading, message = '') {
  statusContainer.style.display = isLoading ? 'block' : 'none';
  if (isLoading) statusMessage.textContent = message;
}

function mostrarError(errorMessage) {
  resultsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; background: #fef2f2; border: 1px solid #f87171; color: #991b1b; padding: 16px; border-radius: 4px; text-align: center;">
      <p><strong>Error en la consulta</strong></p>
      <p style="margin-top: 4px; font-size: 13px;">${errorMessage}</p>
    </div>
  `;
  resultsCount.textContent = 'Error';
}

function escaparHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarVistaPreviaQuery(queryInput.value);
  consultarNasaApi('planets');
});

  
  