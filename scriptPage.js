console.log("Ejecutando script!!!!!!!");

function contienePalabraClave(cadena, palabrasClave) {
    for (let palabra of palabrasClave) {
        if (cadena.toLowerCase().includes(palabra.toLowerCase())) {
            return true; // Si encuentra la palabra clave, devuelve true
        }
    }
    return false; // Si ninguna palabra clave es encontrada, devuelve false
}

// Función para extraer el nombre de una cadena dada
function extraerNombre(elemento) {
    const regex = />([^<]+)</;
    const texto = elemento.innerHTML; // Obtener el contenido HTML del elemento
    const match = texto.match(regex); // Buscar coincidencias con la expresión regular
    if (match && match.length > 1) {
        return match[1]; // Devolver el primer grupo capturado, que es el nombre
    } else {
        return null; // Devolver null si no se encuentra coincidencia
    }
}

//SCROLLLL
const scrollDownUntil = async (callback) => {

    const interval = setInterval(async () => {
        try {
            if (intentos > 3) {
                console.log("Se han hecho 3 intentos sin cargar nuevos registros.");
                callback(false);
            }



            const item = await chrome.storage.sync.get('activate')
            if (!item.activate) {
                console.log(`Proceso Detenido`);
                clearInterval(interval);
                callback(false)
            }

            window.scrollTo(0, document.body.scrollHeight);
            const divElements = document.querySelectorAll('div[role="list"].html-div.xe8uvvx.x11i5rnm.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1oo3vh0.x1rdy4ex');
            let childrenArray = [...divElements[divElements.length - 1].children];

            totalRegistros = childrenArray.length
            console.log(totalRegistros);
            console.log("valores carga", totalRegistros, totalRegistrosParaCargar);
            if (totalRegistros > totalRegistrosParaCargar) {
                console.log(`Se han cargado ${totalRegistros} registros.`);
                clearInterval(interval);
                callback(true)
            } else {
                if (totalRegistros !== totalRegistrosAnterior) {
                    totalRegistrosAnterior = totalRegistros;
                    intentos = 0; // Reiniciar el contador de intentos si hubo un cambio
                } else {
                    intentos++; // Incrementar el contador de intentos si no hubo cambio
                }
            }
        } catch (error) {
            callback(false)
        }
    }, velocidadCargaUsuarios);
}

const hacerClicAgregar = async (child) => {

    // //INFORMACION ADICIONAL
    // const tiempoDiv = child.querySelectorAll('div.xu06os2.x1ok221b > span.x193iq5w')[1]; // Asumiendo que el tiempo está en el segundo span
    // const tiempo = tiempoDiv ? tiempoDiv.textContent.trim() : 'Tiempo no encontrado';
    // const descripcionSpan = child.querySelectorAll('div.xu06os2.x1ok221b > span.x193iq5w')[2]; // Asumiendo que la descripción está en el tercer span
    // const descripcion = descripcionSpan ? descripcionSpan.textContent.trim() : 'Descripción no encontrada';
    // const profileLink = child.querySelector('a[href*="/groups/"][href*="/user/"]');
    //     const userId = profileLink ? profileLink.getAttribute('href').match(/\/user\/(\d+)\//)[1] : null;
    // console.log(`Nombre: ${nombre}, Tiempo: ${tiempo}, Descripción: ${descripcion}`);

    //HACER CLIC
    try {
        const nombre = extraerNombre(child);
        const addButton = child.querySelector('div[aria-label="Agregar"]');
        if (addButton) {
            const profileLink = child.querySelector('a[href*="/groups/"][href*="/user/"]');
            const userId = profileLink ? profileLink.getAttribute('href').match(/\/user\/(\d+)\//)[1] : null;

            // await chrome.storage.session.set({ 'enviarSaludo': userId }, function () {
            //     console.log(`Valor almacenado. ${userId}`);
            // });
            chrome.runtime.sendMessage({ action: "openTab",nombrePerfil:nombre ,idPerfil:userId}, function (response) {
                var tabId = response.nuevoTabSaludoId;
                console.log("ID de la pestaña abierta desde back:", tabId);
    
            });

            console.log("userId", userId);
            conteoInvitacionesDiarias++;

            const timestamp = Date.now();
            const fecha = new Date(timestamp);
            const año = fecha.getFullYear();
            const mes = fecha.getMonth() + 1; // Los meses van de 0 a 11, por lo que se suma 1
            const dia = fecha.getDate();
            const hora = fecha.getHours();
            const minutos = fecha.getMinutes();
            const segundos = fecha.getSeconds();

            // Formatear la salida en un formato legible
            const fechaLegible = `${dia}/${mes}/${año} ${hora}:${minutos}:${segundos}`;



            console.log('Invitacion agregada', nombre, fechaLegible);
            // addButton.click();
            return true
        }
        return false
    } catch (error) {
        console.log(error);
        return false
    }

}

const ejecutarConRetraso = async (data, index) => {
    // Verificar si se han completado todas las iteraciones
    const item = await chrome.storage.sync.get('activate')
    if (!item.activate) return
    if (index >= data.length - 1) {
        console.log("Todas las iteraciones han sido completadas");
        return;
    }
    if (conteoInvitacionesDiarias >= invitacionesDiarias) {
        console.log("Todas las invitaciones han sido completadas!");
        return;
    }

    // Generar un tiempo de espera aleatorio entre 1 y 5 segundos
    const tiempo = await chrome.storage.sync.get('minutes')
    const minutos = tiempo.minutes || 3

    const minutosAleatorios = (Math.floor(Math.random() * (minutos + 1 - minutos)) + minutos) * 60000;
    const segundosAleatorios = (Math.floor(Math.random() * 59) + 1) * 1000;

    var tiempoAleatorio = minutosAleatorios + segundosAleatorios; // Entre 1000 y 6000 milisegundos

    setTimeout(async function () {
        let child = data[index]


        if (enabledKeywords) {
            while (true) {
                const descripcionSpan = child.querySelectorAll('div.xu06os2.x1ok221b > span.x193iq5w')[2]; // Asumiendo que la descripción está en el tercer span
                const descripcion = descripcionSpan ? descripcionSpan.textContent.trim() : 'Descripción no encontrada';
                const contiene = contienePalabraClave(descripcion, keywordsTags)


                if (contiene) {
                    console.log("Elemento:", index);
                    const exito = await hacerClicAgregar(child)
                    if (exito) break;
                    index++
                    if (index >= data.length - 1) {
                        console.log("Sin data para completar la tarea");
                        return;
                    }
                    child = data[index]
                } else {
                    console.log("Elemento:", index);
                    index++
                    if (index >= data.length - 1) {
                        console.log("Sin data para completar la tarea");
                        return;
                    }
                    child = data[index]
                }
            }
        } else {
            while (true) {
                console.log("vamos con el index: ",index);
                const exito =await hacerClicAgregar(child)
                console.log("exito",exito);
                if (exito) break;
                console.log("no hizo el break");
                index++
                if (index >= data.length - 1) {
                    console.log("Sin data para completar la tarea");
                    return;
                }
                child = data[index]
            }
        }

        ejecutarConRetraso(data, index + 1);
    }, 30000);
}

const ejecutarScript = async () => {
    const data = await chrome.storage.sync.get('invitaciones')
    invitacionesDiarias = parseInt(data.invitaciones);
    totalRegistrosParaCargar = invitacionesDiarias + 20;

    const keyActivate = await chrome.storage.sync.get('enableKeywords')
    enabledKeywords = keyActivate.enableKeywords || false

    const keyKeywordsTags = await chrome.storage.sync.get('keywords')
    console.log("paso2");
    if (keyKeywordsTags.keywords === undefined || keyKeywordsTags.keywords === "") {
        keywordsTags = []; // 
        enabledKeywords = false
    } else if (keyKeywordsTags.keywords.includes(",")) {
        console.log("paso3");
        keywordsTags = keyKeywordsTags.keywords.split(",").map(item => item.trim());  // Dividir la cadena en un array utilizando la coma como separador
    } else {
        keywordsTags = [keyKeywordsTags.keywords]; // Si la cadena no contiene comas, el array tendrá un solo elemento que es la cadena completa
    }


    console.log("keywordsTags", keywordsTags, enabledKeywords);

    scrollDownUntil(async (estado) => {
        if (estado) {

            const item = await chrome.storage.sync.get('activate')
            if (!item.activate) return
            const divElements = document.querySelectorAll('div[role="list"].html-div.xe8uvvx.x11i5rnm.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1oo3vh0.x1rdy4ex');
            if (divElements.length > 0) {
                let childrenArray = [...divElements[divElements.length - 1].children];
                ejecutarConRetraso(childrenArray, 0);
            } else {
                console.log('No se encontraron elementos que coincidan con el selector.');
            }
        }
    })
}
let invitacionesDiarias;
let totalRegistrosParaCargar;
let totalRegistros = 0;
let intentos = 0;
let totalRegistrosAnterior = totalRegistros;
let enabledKeywords;
let keywordsTags;

let conteoInvitacionesDiarias = 0
const velocidadCargaUsuarios = 10000
ejecutarScript()

