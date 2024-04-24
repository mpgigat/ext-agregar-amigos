// Función para obtener los valores del almacenamiento local
function getStorageValues(callback) {
  chrome.storage.sync.get(['minutes', 'keywords', 'urls', 'invitaciones', 'enableKeywords', 'segmentoSeleccionado', 'enableSegmento', 'loginStatus', 'userEmail', 'token'], function (items) {
    callback(items);
  });
}

// Función para guardar los valores en el almacenamiento local
function saveStorageValues(minutes, keywords, urls, urlsWork, invitaciones, enableKeywords, segmentoSeleccionado, enableSegmento, callback) {
  chrome.storage.sync.set({
    'minutes': minutes,
    'keywords': keywords,
    'urls': urls,
    'urlsWork': urlsWork,
    'invitaciones': invitaciones,
    'enableKeywords': enableKeywords,
    'segmentoSeleccionado': segmentoSeleccionado,
    'enableSegmento': enableSegmento
  }, function () {
    callback();
  });
}

// Función para inicializar los valores de los campos de entrada
function initializeFields() {
  getStorageValues(function (items) {

    document.getElementById('minutes').value = items.minutes || 3;
    document.getElementById('keywords').value = items.keywords || '';
    document.getElementById('urls').value = items.urls || '';
    document.getElementById('invitaciones').value = items.invitaciones || '';
    document.getElementById('enableKeywords').checked = items.enableKeywords || false;
    document.getElementById('desplegable').value = items.segmentoSeleccionado || '';
    document.getElementById('enabledSaludo').checked = items.enableSegmento || false;
    document.getElementById('userEmail').value = items.userEmail || '';

    const loginStatus = items.loginStatus || false
    // var loginStatusIcon = document.getElementById('loginStatusIcon');
    loginStatusIcon.src = loginStatus ? 'images/loginActivo.png' : 'images/loginInactivo.png';

    httpLogin("LOADING")

  });
}

// Función para manejar el clic en el botón Guardar
function handleSaveButtonClick() {
  var minutes = parseInt(document.getElementById('minutes').value);
  var keywords = document.getElementById('keywords').value;
  var urls = document.getElementById('urls').value;
  var invitaciones = document.getElementById('invitaciones').value;
  var enableKeywords = document.getElementById('enableKeywords').checked;
  var segmentoSeleccionado = document.getElementById('desplegable').value;
  var enableSegmento = document.getElementById('enabledSaludo').checked;

  var urlSplit = urls.split('\n');
  const urlsWork = []
  for (var i = 0; i < urlSplit.length; i++) {
    urlsWork.push(urlSplit[i])
  }

  chrome.storage.sync.set({
    'activate': false
  });

  saveStorageValues(minutes, keywords, urls, urlsWork, invitaciones, enableKeywords, segmentoSeleccionado, enableSegmento, function () {
    if (urlsWork.length == 0) alert('El proceso no se ejecutara al menos de que se configure un grupo');
    else alert('¡Configuración guardada correctamente!');
  });
}

const llenarDesplegableSegmentos = async () => {
  const selectDesplegableSegmentos = document.getElementById("desplegable");
  selectDesplegableSegmentos.innerHTML = "";

  const item = await chrome.storage.sync.get('segmentos')
  if (item.segmentos) {
    item.segmentos.forEach(segmento => {
      const option = document.createElement("option");
      option.value = segmento.titulo; // El valor de la opción es el título del segmento
      option.text = segmento.titulo; // El texto visible es también el título del segmento
      selectDesplegableSegmentos.appendChild(option); // Agregar la opción al desplegable
    });
  }
}

const devuelveSegmentos = async () => {

  const item = await chrome.storage.sync.get('segmentos')
  if (item.segmentos) {
    return item.segmentos
  }
  return [];
}

function agregarSaludoChip(mensaje) {
  let divChip = document.createElement("div");
  divChip.classList.add("chip");

  let divContent = document.createElement("div");
  divContent.classList.add("chip-content");
  divContent.textContent = mensaje
  divChip.appendChild(divContent);

  let divChipClose = document.createElement("div");
  divChipClose.classList.add("chip-close");

  // Crear un nuevo elemento svg
  let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.classList.add("chip-svg");
  svgElement.setAttribute("focusable", "false");
  svgElement.setAttribute("viewBox", "0 0 24 24");
  svgElement.setAttribute("aria-hidden", "true");

  // Crear un nuevo elemento path
  let pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("d", "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z");

  svgElement.appendChild(pathElement);

  divChipClose.appendChild(svgElement);

  divChipClose.onclick = function () {
    let confirmacion = window.confirm("¿Estás seguro de que deseas realizar esta acción?");
    if (confirmacion) {
      var mensajeEliminar = this.parentNode.textContent;
      eliminarSegmentoTemporal(mensajeEliminar)
      this.parentNode.remove();
    }

  };

  divChip.appendChild(divChipClose);
  document.getElementById("mensajesList").appendChild(divChip);
}

function eliminarSegmentoTemporal(mensaje) {
  let index = segmentosTemp.values.indexOf(mensaje);
  if (index !== -1) {
    segmentosTemp.values.splice(index, 1);
    console.log("Mensaje eliminado:", mensaje);
  } else {
    console.log("El mensaje no existe en el array.");
  }
}

const cargarSegmentosStorage = async () => {
  const phraseList = document.getElementById("phraseList");
  phraseList.innerHTML = "";

  const segmentos = await devuelveSegmentos()
  segmentos.forEach(segmento => {
    const listItem = document.createElement("li"); // Crear un elemento <li> para cada título
    listItem.style.width = "300px"
    listItem.style.display = "flex"
    listItem.style.justifyContent = "space-between";
    listItem.style.alignItems = "center"
    const titleElement = document.createElement("span");
    titleElement.textContent = segmento.titulo;

    listItem.appendChild(titleElement); // Agregar el título al elemento <li>
    const divBotones = document.createElement("div");
    // Crear imagen de editar
    const editarImg = document.createElement("img");
    editarImg.src = "images/boligrafo.png";
    editarImg.alt = "Editar";
    editarImg.style.width = "20px"
    editarImg.style.height = "20px"
    editarImg.style.marginRight = "5px";
    editarImg.style.cursor = "pointer";
    editarImg.onclick = async () => {
      const data = titleElement.textContent;
      accionCrud = "EDIT"

      popupAgregarSegmento.style.display = "block";
      const segmento = await buscarSegmentoPorTitulo(data)

      if (segmento) {
        const mensajesList = document.getElementById("mensajesList");
        mensajesList.innerHTML = "";
        segmentosTemp = segmento
        tituloSegmento.value = segmento.titulo
        segmentosTemp.values.forEach(item => {
          console.log("imprimiendi", item);
          // agregarElementoTemporal(item)
          agregarSaludoChip(item)
        });
      } else segmentosTemp = {}



    }; // Asignar la función editarSegmento al clic
    divBotones.appendChild(editarImg); // Agregar la imagen de editar al elemento <li>

    // Crear imagen de eliminar
    const eliminarImg = document.createElement("img");
    eliminarImg.src = "images/eliminar.png";
    eliminarImg.alt = "Eliminar";
    eliminarImg.style.width = "20px"
    eliminarImg.style.height = "20px"
    eliminarImg.style.marginRight = "25px";
    eliminarImg.style.cursor = "pointer";
    eliminarImg.onclick = async () => {



    }; // Asignar la función eliminarSegmento al clic
    divBotones.appendChild(eliminarImg); // Agregar la imagen de eliminar al elemento <li>
    listItem.appendChild(divBotones); // Agregar la imagen de eliminar al elemento <li>
    phraseList.appendChild(listItem); // Agregar el elemento <li> a la lista de frases


  });
}

const cargarSegmentosStorageLista = async () => {
  const phraseList = document.getElementById("phraseList");
  phraseList.innerHTML = "";
  const segmentos = await devuelveSegmentos()
  segmentos.forEach(segmento => {
    const divChip = cargarSegmentosStorageChips(segmento.titulo)
    phraseList.appendChild(divChip);
  });

}

const cargarSegmentosStorageChips = (mensaje) => {
  let divChip = document.createElement("div");
  divChip.classList.add("chip");

  let divContent = document.createElement("div");
  divContent.classList.add("chip-content");
  divContent.textContent = mensaje
  divChip.appendChild(divContent);

  let divBotones = document.createElement("divBotones");
  divBotones.classList.add("updateDeleteButtons")

  // Crear actualizar elemento svg 
  let divChipEdit = document.createElement("div");
  divChipEdit.classList.add("chip-close");

  let svgElementEdit = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElementEdit.classList.add("chip-svg");
  svgElementEdit.classList.add("chip-svg-update")
  // svgElementEdit.classList.add("chip-svg-update");
  svgElementEdit.setAttribute("focusable", "false");
  svgElementEdit.setAttribute("viewBox", "0 0 24 24");
  svgElementEdit.setAttribute("aria-hidden", "true");

  let pathElementEdit = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElementEdit.setAttribute("d", "M19.3 3.4l1.3 1.3c.4.4.4 1 0 1.4L5.6 20.3c-.1.1-.2.2-.4.2h-.1c-.1 0-.2-.1-.2-.2l-1.3-1.3c-.1-.1-.2-.2-.2-.3s.1-.2.2-.3l14.6-14.6c.4-.4 1-.4 1.4 0zM5 18.6l12.2-12.2 1.6 1.6L6.6 20.2 5 18.6zm14.3-13.3l-.7.7-1.6-1.6.7-.7c.2-.2.5-.2.7 0l.9.9c.2.2.2.5 0 .7z");

  svgElementEdit.appendChild(pathElementEdit);

  divChipEdit.appendChild(svgElementEdit);

  divChipEdit.onclick = async function () {
    accionCrud = "EDIT"

    popupAgregarSegmento.style.display = "block";
    const segmento = await buscarSegmentoPorTitulo(mensaje)

    if (segmento) {
      const mensajesList = document.getElementById("mensajesList");
      mensajesList.innerHTML = "";
      segmentosTemp = segmento
      tituloSegmento.value = segmento.titulo
      segmentosTemp.values.forEach(item => {
        // agregarElementoTemporal(item)
        agregarSaludoChip(item)
      });
    } else segmentosTemp = {}
  };
  divBotones.appendChild(divChipEdit);


  // Crear eliminar elemento svg
  let divChipClose = document.createElement("div");
  divChipClose.classList.add("chip-close");
  let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.classList.add("chip-svg");
  svgElement.setAttribute("focusable", "false");
  svgElement.setAttribute("viewBox", "0 0 24 24");
  svgElement.setAttribute("aria-hidden", "true");
  let pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("d", "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z");

  svgElement.appendChild(pathElement);

  divChipClose.appendChild(svgElement);

  divChipClose.onclick = async function () {

    let confirmacion = window.confirm("¿Estás seguro de que deseas realizar esta acción?");
    if (confirmacion) {
      let segmentosStorage = []
      const items = await chrome.storage.sync.get('segmentos')
      if (items.segmentos) {
        segmentosStorage = items.segmentos

        const indice = segmentosStorage.findIndex(item => item.titulo === mensaje);

        if (indice !== -1) {
          segmentosStorage.splice(indice, 1);
        }

        await chrome.storage.sync.set({ 'segmentos': segmentosStorage }, function () {
          console.log('Valor almacenado.', segmentosStorage);
        });
      }

    }

    // cargarSegmentosStorage()
    cargarSegmentosStorageLista()
  };
  divBotones.appendChild(divChipClose);
  divChip.appendChild(divBotones);
  return divChip
}

const buscarSegmentoPorTitulo = async (tituloBuscado) => {
  const item = await chrome.storage.sync.get('segmentos')
  console.log("accionCrud", accionCrud);
  if (item.segmentos) {
    for (const segmento of item.segmentos) {
      if (segmento.titulo === tituloBuscado) {
        if (accionCrud == "EDIT") return segmento;
        return true
      }
    }
    console.log("nosenose", item.segmentos);
    return item.segmentos
  }

  return null; // Retorna null si el título no se encuentra
}

const actualizarSegmentoExistente = async (nuevoSegmento) => {
  const item = await chrome.storage.sync.get('segmentos')
  if (item.segmentos) {
    const indice = item.segmentos.findIndex(seg => seg.titulo === nuevoSegmento.titulo);

    if (indice !== -1) {
      item.segmentos[indice].values = segmentosTemp.values;
      await chrome.storage.sync.set({ 'segmentos': item.segmentos }, function () {
        console.log('Valor almacenado.', item.segmentos);
      });
    } else {
      console.log('No se encontró ningún segmento con el título proporcionado.');
    }
  }
}

const insertarNombreTextAreaFuncion = () => {
  var input = document.getElementById("textoSegmentoLista");
  var inicio = input.selectionStart; // Obtener la posición de inicio del cursor
  var fin = input.selectionEnd; // Obtener la posición de fin del cursor
  console.log("data anes", input.value, inicio, fin);
  var textoAntes = input.value.substring(0, inicio);
  var textoDespues = input.value.substring(fin, input.value.length);

  input.value = `${textoAntes.trim()} {{nombre}} ${textoDespues}`;

  // Mover el cursor al final del texto insertado
  var nuevaPosicion = input.value.indexOf("{{nombre}}") + "{{nombre}}".length;
  input.setSelectionRange(nuevaPosicion, nuevaPosicion);
  input.focus();
}

const httpLogin = (src) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "email": userEmail.value,
    "token": "12345678",
    "app": 1
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  fetch("https://bothttpamway.vidasana.wiki/api/usuarios-apps/login", requestOptions)
    .then((response) => {
      if (response.ok) {
        console.log('La solicitud fue exitosa. Código de estado:', response.status);
        chrome.storage.sync.set({
          'loginStatus': true
        });
        return response.json();
      } else {
        throw new Error('Error en la solicitud');
      }
    })
    .then((result) => {
      // var loginStatusIcon = document.getElementById('loginStatusIcon');
      loginStatusIcon.src = 'images/loginActivo.png'
      if (src != "LOADING") {
        alert("Licencia ok")


        chrome.storage.sync.set({
          'userEmail': userEmail.value
        });
        popupLogin.style.display = "none";
        overlay.style.display = 'none';
      }
    })
    .catch((error) => {
      loginStatusIcon.src = 'images/loginInactivo.png'

      chrome.storage.sync.set({
        'loginStatus': false
      });
    })
}

let segmentosTemp = {
  values: []
}

let accionCrud;

document.addEventListener('DOMContentLoaded', function () {
  llenarDesplegableSegmentos()
  initializeFields();


  const overlay = document.getElementById('overlay');

  const popupIcon = document.getElementById("popupIcon");
  const popupWindow = document.getElementById("popupWindow");
  const closeButton = document.getElementById("closeButton");
  let loginStatusIcon = document.getElementById("loginStatusIcon");

  const popupLogin = document.getElementById("popupLogin");
  const validarLogin = document.getElementById("validarLogin");
  const cerrarLogin = document.getElementById("cerrarLogin");
  const userEmail = document.getElementById("userEmail");

  const popupAgregarSegmentoIcon = document.getElementById("popupAgregarSegmentoIcon");
  const popupAgregarSegmento = document.getElementById("popupAgregarSegmento");
  const closeButtonAgregarSegmento = document.getElementById("closeButtonAgregarSegmento");
  const guardarButtonAgregarSegmento = document.getElementById("guardarButtonAgregarSegmento");


  const agregarSegmentoLista = document.getElementById("agregarSegmentoLista");
  const textoSegmentoLista = document.getElementById("textoSegmentoLista");
  const tituloSegmento = document.getElementById("tituloSegmento");
  const backIconPopup = document.getElementById("backIconPopup");
  const insertarNombreTextArea = document.getElementById("insertarNombreTextArea");



  // EVENTOS POPUT PRINCIPAL
  popupIcon.addEventListener("click", async function () {
    if (popupWindow.style.display === "block") {
      popupWindow.style.display = "none";
      overlay.style.display = 'none';
    } else {
      // cargarSegmentosStorage()
      cargarSegmentosStorageLista()
      popupWindow.style.display = "block";
      overlay.style.display = 'block';
    }
  });
  closeButton.addEventListener("click", function () {
    // Ocultamos la ventana emergente cuando se hace clic en el botón de cerrar
    popupWindow.style.display = "none";
    overlay.style.display = 'none';
    llenarDesplegableSegmentos()
  });

  //****************login***************** */
  loginStatusIcon.addEventListener("click", async function () {
    if (popupLogin.style.display === "block") {
      popupLogin.style.display = "none";
      overlay.style.display = 'none';
    } else {
      popupLogin.style.display = "block";
      overlay.style.display = 'block';
    }
  });
  cerrarLogin.addEventListener("click", function () {
    overlay.style.display = 'none';
    popupLogin.style.display = "none";
  });
  validarLogin.addEventListener("click", function () {
    httpLogin("SCREEN")
  })
  //EVENTOS POPUP SEGMENTOS
  popupAgregarSegmentoIcon.addEventListener("click", function () {
    popupWindow.style.display = "none";
    if (popupAgregarSegmento.style.display === "block") {
      popupAgregarSegmento.style.display = "none";
    } else {
      accionCrud = "ADD"
      segmentosTemp = {
        values: []
      }
      const mensajesList = document.getElementById("mensajesList");
      var input = document.getElementById("textoSegmentoLista");
      mensajesList.innerHTML = "";
      input.value = ""
      tituloSegmento.value = ""
      popupAgregarSegmento.style.display = "block";
    }

  });
  agregarSegmentoLista.addEventListener("click", async function () {
    if (textoSegmentoLista.value != "") {
      const mensajesList = document.getElementById("mensajesList");
      mensajesList.innerHTML = "";

      segmentosTemp.values.push(textoSegmentoLista.value.trim())

      segmentosTemp.values.forEach(item => {
        // agregarElementoTemporal(item)
        agregarSaludoChip(item)
      });
      // document.getElementById("mensajesList").appendChild(htmlCardListSegmento);
      textoSegmentoLista.value = ""
    }
  });
  guardarButtonAgregarSegmento.addEventListener("click", async function () {
    if (tituloSegmento.value != "") {

      segmentosTemp.titulo = tituloSegmento.value.toUpperCase()
      const listadoSegmentos = await buscarSegmentoPorTitulo(segmentosTemp.titulo);

      if (listadoSegmentos === null) {
        const segmentos = [segmentosTemp]
        await chrome.storage.sync.set({ 'segmentos': segmentos }, function () {
          console.log('Valor almacenado.', segmentos);
        });
      } else if (Array.isArray(listadoSegmentos)) {
        listadoSegmentos.push(segmentosTemp)
        await chrome.storage.sync.set({ 'segmentos': listadoSegmentos }, function () {
          console.log('Valor almacenado.', listadoSegmentos);
        });
      } else if (typeof listadoSegmentos == "object") {
        await actualizarSegmentoExistente(listadoSegmentos)
      } else if (typeof listadoSegmentos == "boolean") {
        alert(`El segmento ${segmentosTemp.titulo} ya existe`)
        return
      }

      // cargarSegmentosStorage()
      cargarSegmentosStorageLista()

      popupWindow.style.display = "block";
      popupAgregarSegmento.style.display = "none";
    } else {
      alert("El titulo no puede estar vacio")
    }
  });
  closeButtonAgregarSegmento.addEventListener("click", function () {
    popupWindow.style.display = "block";
    popupAgregarSegmento.style.display = "none";
  });
  backIconPopup.addEventListener("click", function () {
    popupWindow.style.display = "block";
    popupAgregarSegmento.style.display = "none";
  });
  insertarNombreTextArea.addEventListener("click", function () {
    insertarNombreTextAreaFuncion()
  });


  //*****************************FUNCIONALIDAD**************************************

  document.getElementById('saveButton').addEventListener('click', handleSaveButtonClick);
  document.getElementById('runWork').addEventListener('click', async () => {
    const key = await chrome.storage.sync.get('loginStatus')

    if (key.loginStatus) {
      chrome.storage.sync.set({
        'activate': true
      });
      chrome.runtime.sendMessage({ action: "ejecutarCodigo" });
    } else {
      alert("No hay una licencia activa")
    }



  })
  document.getElementById('stopWork').addEventListener('click', () => {
    console.log("cmabio estado a falso");
    chrome.storage.sync.set({
      'activate': false
    });

  })
});


