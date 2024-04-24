// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log("pasando");
//   if (request.action === "getDOM") {
//     console.log("dfsdfasdfsad");
//     sendResponse({ dom: document.documentElement.outerHTML });
//     // sendResponse({ dom: document.querySelector('[aria-label="Agregar"]') });

//   } else if (request.action === "hazClic") {
//     sendResponse({ accion: "ya hice clic" });
//   }
// });


// // Selecciona los primeros dos elementos que coinciden con el patrón del botón "Agregar"
// // Variable para la cadena de búsqueda
// // Definir la cadena de búsqueda
// var busqueda = "Fernando Oliveros"; // Cambia esto por la cadena que deseas buscar


// // const divElements = document.querySelectorAll('div[role="list"].html-div.xe8uvvx.x11i5rnm.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1oo3vh0.x1rdy4ex');

// // divElements.forEach((divElement, index) => {
// //     // Realiza el proceso deseado en cada elemento div
// //     console.log(`Proceso en el elemento ${index + 1}`);
// //     console.log(divElement);
// //     // Aquí puedes agregar tu lógica para procesar cada elemento div

// //     // Convierte children a un array usando el operador de propagación
// //     const childrenArray = [...divElement.children];
// //     childrenArray.forEach(child => {
// //         // Haz algo con cada hijo del divElement
// //         console.log(child);
// //     });
// // });


// // Función para extraer el nombre de una cadena dada
// function extraerNombre(elemento) {
//   const regex = />([^<]+)</;
//   const texto = elemento.innerHTML; // Obtener el contenido HTML del elemento
//   const match = texto.match(regex); // Buscar coincidencias con la expresión regular
//   if (match && match.length > 1) {
//     return match[1]; // Devolver el primer grupo capturado, que es el nombre
//   } else {
//     return null; // Devolver null si no se encuentra coincidencia
//   }
// }

// //SCROLLLL

// const scrollDownUntil = async (callback) => {

//   const interval = setInterval(() => {
//     if (intentos >= 3) {
//       console.log("Se han hecho 3 intentos sin cargar nuevos registros.");
//       callback(true);
//     }
//     window.scrollTo(0, document.body.scrollHeight);
//     const divElements = document.querySelectorAll('div[role="list"].html-div.xe8uvvx.x11i5rnm.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1oo3vh0.x1rdy4ex');
//     let childrenArray = [...divElements[divElements.length - 1].children];

//     totalRegistros = childrenArray.length
//     console.log(totalRegistros);
//     // Verificar si se cumple la condición
//     if (totalRegistros  > totalRegistrosParaCargar) {
//       clearInterval(interval);
//       console.log("Se han cargado 300 registros.");
//       callback(true)
//     } else {
//       // Verificar si el número total de registros ha cambiado
//       if (totalRegistros !== totalRegistrosAnterior) {
//         totalRegistrosAnterior = totalRegistros;
//         intentos = 0; // Reiniciar el contador de intentos si hubo un cambio
//       } else {
//         intentos++; // Incrementar el contador de intentos si no hubo cambio
//       }
//     }
//   }, velocidadCargaUsuarios); // Intervalo de 1 segundo
// }


// // Ejecutar el desplazamiento




// let totalRegistrosParaCargar = 40;
// let totalRegistros = 0;
// let intentos = 0;
// let totalRegistrosAnterior = totalRegistros;
// const velocidadCargaUsuarios = 2000

// scrollDownUntil((estado) => {
//   if (estado) {

//     const divElements = document.querySelectorAll('div[role="list"].html-div.xe8uvvx.x11i5rnm.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1oo3vh0.x1rdy4ex');

//     if (divElements.length > 0) {
//       let childrenArray = [...divElements[divElements.length - 1].children];
//       childrenArray.forEach((child, index) => {
//         console.log(index);
//         // //HACER CLIC
//         // const addButton = child.querySelector('div[aria-label="Agregar"]');
//         // if (addButton) {
//         //   // Hacer clic en el botón "Agregar"
//         //   setTimeout(() => {
//         //     addButton.click();
//         //   }, index * 20000);

//         // }
//         ////INFORMACION ADICIONAL
//         // const nombre = extraerNombre(child);
//         // const tiempoDiv = child.querySelectorAll('div.xu06os2.x1ok221b > span.x193iq5w')[1]; // Asumiendo que el tiempo está en el segundo span
//         // const tiempo = tiempoDiv ? tiempoDiv.textContent.trim() : 'Tiempo no encontrado';
//         // const descripcionSpan = child.querySelectorAll('div.xu06os2.x1ok221b > span.x193iq5w')[2]; // Asumiendo que la descripción está en el tercer span
//         // const descripcion = descripcionSpan ? descripcionSpan.textContent.trim() : 'Descripción no encontrada';
//         // console.log(`Nombre: ${nombre}, Tiempo: ${tiempo}, Descripción: ${descripcion}`);
//       });
//     } else {
//       console.log('No se encontraron elementos que coincidan con el selector.');
//     }


//   }
// })

