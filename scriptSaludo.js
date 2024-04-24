const obtenerIdPerfil = (url) => {
    var regex = /(?:\?|&)id=(\d+)(?:&|$)/;
    var match = regex.exec(url);
    if (match) return match[1];
    else return null
}

const buscarSegmentoPorTituloScript = async (tituloBuscado) => {
    const item = await chrome.storage.sync.get('segmentos')
    if (item.segmentos) {
        for (const segmento of item.segmentos) {
            if (segmento.titulo === tituloBuscado) {

                return segmento.values
            }
        }
    }
    return []; // Retorna null si el título no se encuentra
}

const seleccionarMensajeAleatorio = async (nombre) => {
    const itemSeleccionado = await chrome.storage.sync.get('segmentoSeleccionado')
    const itemActivacion = await chrome.storage.sync.get('enableSegmento')
    if (itemSeleccionado && itemActivacion && itemActivacion.enableSegmento) {
        const listadoMensajes = await buscarSegmentoPorTituloScript(itemSeleccionado.segmentoSeleccionado)
        if (listadoMensajes.length > 0) {
            var indiceAleatorio = Math.floor(Math.random() * listadoMensajes.length);
            let mensaje = listadoMensajes[indiceAleatorio]
            if (mensaje.includes("{{nombre}}")) {
                var primerNombre = nombre.split(' ')[0];
                if (primerNombre.length>0) mensaje = mensaje.replace('{{nombre}}', primerNombre);
            }
            return mensaje
        }

    }
    return null
}

const obtenerNombre = () => {
    var nombreElemento = document.querySelector('span.mToken');
    if (nombreElemento) {
        var valorInput = nombreElemento.querySelector('input[data-sigil="token-value"]').value;
        var primerNombre = valorInput.split(' ')[0];
        return primerNombre
    } else {
        return null
    }
}

setTimeout(async () => {
    var textarea = document.querySelector('textarea._5whq.input._52t1');
    if (textarea) {
        chrome.runtime.sendMessage({ action: "getTabId" }, async function (response) {
            let mensaje = await seleccionarMensajeAleatorio(response.nombrePerfil)
            textarea.value = mensaje
            var botonEnviar = document.querySelector('button[value="Enviar"]');
            // botonEnviar.click();
            var tabId = response.tabId;
            console.log("ID de la pestaña actual desde back:", tabId);
            setTimeout(async () => {
                // await chrome.storage.session.set({ 'saludoEnviado': tabId }, function () {
                //     console.log('Valor almacenado en saludo');
                // });
                chrome.runtime.sendMessage({ action: "closeTab",tabId}, function (response) {
                    console.log('Orden de cierre enviada');
        
                });
            }, 5000);

        });





    }

}, 10000);