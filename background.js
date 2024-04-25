function generarIntervaloAleatorio() {
    const minutos = Math.floor(Math.random() * 60);
    const segundos = Math.floor(Math.random() * 60);
    const hora = 7 + Math.floor(Math.random() * 2);
    return (hora * 3600 + minutos * 60 + segundos) * 1000;
}

const trabajoDiario = async () => {
    const item = await chrome.storage.sync.get('activate')
    if (!item.activate) return
    getTabWork();

    // Calcular el tiempo hasta las 7 am de mañana
    const ahora = new Date();
    const manana = new Date(ahora);
    const horaAleatoria = Math.random() * (7 - 5) + 5;
    const minutosAleatorios = Math.floor(Math.random() * 59) + 1;
    manana.setDate(ahora.getDate() + 1);
    manana.setHours(horaAleatoria);
    manana.setMinutes(minutosAleatorios);
    manana.setSeconds(0);
    manana.setMilliseconds(0);

    const tiempoHastaManana = manana - ahora;

    setTimeout(() => {
        trabajoDiario();
    }, tiempoHastaManana);
}

const tareaDiaria = (tabId) => {
    if (indexUrl >= urlsWork.length) indexUrl = 0
    const urlToLoad = urlsWork[indexUrl]
    indexUrl++;

    chrome.tabs.update(tabId, { active: true }, () => {
        const currentTabId = tabId;
        chrome.tabs.update(currentTabId, { url: urlToLoad }, function (updatedTab) {
            chrome.tabs.onUpdated.addListener(function onTabUpdated(tabId, changeInfo, tab) {
                // Verifica si la actualización corresponde a la pestaña que estamos manipulando y si la carga ha terminado
                if (tabId === currentTabId && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(onTabUpdated);  // Remueve el listener para evitar llamadas múltiples

                    if (chrome.runtime.lastError) {
                        console.error('Runtime Error:', chrome.runtime.lastError);
                        return;
                    }

                    chrome.scripting.executeScript({
                        target: { tabId: currentTabId }, 
                        files: ['scriptPage.js']
                    }).then((result) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error ejecutando script:', chrome.runtime.lastError);
                            return;
                        }
                        console.log("Ejecutando script");
                    }).catch(error => {
                        console.error("Error durante la ejecución del script: ", error);
                    });
                }
            });
        });



        //});
    });
}

const getTabWork = async () => {

    await chrome.tabs.query({}, function (tabs) {
        var facebookTabs = [];
        tabs.forEach(function (tab) {
            if (tab.url.includes("facebook")) {
                facebookTabs.push(tab);
            }
        });
        if (facebookTabs.length > 0) {
            var tabId = facebookTabs[0].id;
            tareaDiaria(tabId)
        } else {
            chrome.tabs.create({ url: "https://www.facebook.com" }, function (tab) {
                var nuevaPestanaId = tab.id;
                console.log("La nueva pestaña se creó con el ID: " + nuevaPestanaId);
                tareaDiaria(nuevaPestanaId)
            });
        }
    });
}



let indexUrl = 0;
let urlsWork;
let nuevoTabSaludoId;
// let nuevoTabPerfilId;
let nombrePerfilNewTab;
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.action === "ejecutarCodigo") {
        //-*********************************SE DEBE EJECUTAR DIARIO, ES EL QUE CARGA EL SITIO****************************************************

        const data = await chrome.storage.sync.get('urlsWork')
        urlsWork = data.urlsWork
        indexUrl = 0
        if (urlsWork.length == 0) return


        trabajoDiario()

    } else if (message.action === "getTabId") {
        sendResponse({ tabId: nuevoTabSaludoId, nombrePerfil: nombrePerfilNewTab });
    } else if (message.action === "openTab") {

        nombrePerfilNewTab = message.nombrePerfil
        const idPerfil = message.idPerfil
        const urlSaludo = `https://m.facebook.com/messages/thread/${idPerfil}`
        // const urlSaludo = `https://m.facebook.com/messages/thread/61552262345283`
        chrome.tabs.create({ url: urlSaludo }, function (tab) {
            nuevoTabSaludoId = tab.id;
            // nuevoTabPerfilId = changes['enviarSaludo'].newValue;            

            chrome.tabs.onUpdated.addListener(function onTabUpdated(nuevoTabSaludoId, changeInfo, tab) {

                if (changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(onTabUpdated);  // Remueve el listener para evitar llamadas múltiples

                    if (chrome.runtime.lastError) {
                        console.error('Runtime Error:', chrome.runtime.lastError);
                        return;
                    }

                    chrome.scripting.executeScript({
                        target: { tabId: nuevoTabSaludoId },
                        files: ['scriptSaludo.js']
                    }).then((result) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error ejecutando script Saludo:', chrome.runtime.lastError);
                            return;
                        }
                        console.log("Ejecutando script Saludo");
                    }).catch(error => {
                        console.error("Error durante la ejecución del script Saludo: ", error);
                    });
                }
            });

        });
        sendResponse({ tabId: nuevoTabSaludoId });
    } else if (message.action === "closeTab") {
        if (message.tabId == nuevoTabSaludoId) {            
            chrome.tabs.remove(nuevoTabSaludoId, async function () {
                console.log("Cerrando pestaña ", nuevoTabSaludoId);

            });
        }
    }
});
