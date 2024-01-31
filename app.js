// Debemos convertir todas las mayusculas en minusculas
//no se pueden usar caracteres especiales {ñ, acentos, numerales, procentajes, etc}
const imagen = document.querySelector(".mensaje-sin-ingresar");
const cajaParaMostrarMensajes = document.querySelector(".box-mostrar p");
const panelDeTextos = document.querySelector(".mostrar-texto");
const textArea = document.querySelector("textarea");
const bordeDerechoTextArea = `${
  textArea.getBoundingClientRect().x + textArea.getBoundingClientRect().width
}px`;
const parteSuperiorTextArea = `${textArea.getBoundingClientRect().y - 10}px`;
const botonCopiar = document.createElement("button");
const botonEncriptar = document.querySelector(".boton-encriptar");
const botonDesencriptar = document.querySelector(".boton-desencriptar");
let textoOriginal = "";
const validationRegex = /[^a-zA-Z\s\u00C0-\u017F]/g;
const formulario = document
  .querySelector("form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
  });

// window events

//copy event

window.onload = (e) => {
  botonCopiar.innerText = "Copiar";
  botonCopiar.addEventListener("click", async () => {
    const texto = cajaParaMostrarMensajes.innerHTML;
    const blob = new Blob([texto], { type: "text/plain" });
    const data = [new ClipboardItem({ ["text/plain"]: blob })];
    await navigator.clipboard.write(data);
  });

  botonCopiar.setAttribute("class", "boton-copiar");
  panelDeTextos.insertAdjacentElement("beforeend", botonCopiar);
};

const acentos = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ñ: "n",
  ç: "c",
  č: "c",
  ď: "d",
  ě: "e",
  ē: "e",
  ĕ: "e",
  ē: "e",
  è: "e",
  ü: "u",
};
const clavesDeCifrado = {
  a: "ai",
  o: "ober",
  i: "imes",
  e: "enter",
  u: "ufat",
};

// funciones //

function mostrarImagen() {
  const regex = / ./g;
  if (textArea.value === "") {
    imagen.style.display = "block";
    panelDeTextos.style.justifyContent = "flex-start";
    botonCopiar.style.display = "none";
    cajaParaMostrarMensajes.innerHTML = "";
  }
}

function encriptar(str) {
  let i = 0;
  let textEncriptado = "";
  while (i < str.length) {
    if (str[i] in clavesDeCifrado) {
      textEncriptado += clavesDeCifrado[str[i]];
    } else {
      textEncriptado += str[i];
    }

    i++;
  }

  return textEncriptado;
}

function existenMayusculas(str) {
  if (str.match(/[A-Z]/)) {
    return true;
  }

  return false;
}

function existenCaracteresEspeciales(str) {
  if (str.match(validationRegex)) {
    return true;
  } else {
    return false;
  }
}

function existenAcentos(str) {
  for (i = 0; i < str.length; i++) {
    if (str[i] in acentos) {
      return true;
    }
  }

  return false;
}

function validacion(str) {
  let mensajesDeValidacion;

  if (str === "") {
    mensajesDeValidacion = {
      mensajeTextoVacio: { msj: "Debe ingresar un texto" },
    };
  }

  if (existenMayusculas(str)) {
    mensajesDeValidacion = {
      mensajeMayus: {
        msj: "Hay caracteres en mayúsculas",
        aplicarCorreccion: (str) => {
          textArea.value = str.toLowerCase();
        },
      },
    };
  }

  if (existenCaracteresEspeciales(str)) {
    mensajesDeValidacion = {
      ...mensajesDeValidacion,
      mensajeCaracteresEsp: {
        msj: "Hay caracteres prohibidos",
        aplicarCorreccion: (str) => {
          textArea.value = str.replace(validationRegex, "");
        },
      },
    };
  }

  if (existenAcentos(str.toLowerCase())) {
    mensajesDeValidacion = {
      ...mensajesDeValidacion,
      mensajeAcentos: {
        msj: "Hay acentos",
        aplicarCorreccion: (str) => {
          textArea.value = str
            .split("")
            .map((letra) => acentos[letra] || letra)
            .join("")
            .toString();
        },
      },
    };
  }

  if (!mensajesDeValidacion) {
    return [false, mensajesDeValidacion];
  } else {
    return [true, mensajesDeValidacion];
  }
}

function insertarTextoEnCaja(str) {
  cajaParaMostrarMensajes.innerHTML = str;
}

function ocultarImagen() {
  imagen.style.display = "none";
}

function crearCuadroDeDialogo(
  textoVacio,
  listaDeMensajes,
  tipoDeProceso,
  mensajeDeValidacion
) {
  let dialog = document.querySelector(".caja-mensaje-validacion");
  dialog = document.createElement("div");
  dialogButton = document.createElement("button");
  dialogButton.textContent = textoVacio ? "Cerrar" : "Corregir errores";
  dialogButton.addEventListener("click", (e) => {
    e.target.classList.add("boton-clickado");
    e.target.textContent = "Done";
    if (textoVacio) {
      eliminarMensajeValidacion();
    } else {
      corregirErrores(mensajeDeValidacion, tipoDeProceso);
    }
  });
  dialogButton.setAttribute("class", "dialog-btn");
  dialog.addEventListener("animationend", (e) => {
    if (e.target.style.animationName === "entradaMensajeValidacion") {
      e.target.style.top = "10%";
    } else {
      e.target.style.top = "-15%";
    }
  });
  dialog.innerHTML = `<ul>${listaDeMensajes}</ul>`;
  dialog.insertAdjacentElement("beforeend", dialogButton);
  dialog.setAttribute("class", "caja-mensaje-validacion");
  dialog.style.top = `${parteSuperiorTextArea}`;
  document.body.appendChild(dialog);
  dialog.style.animation = "entradaMensajeValidacion .2s ease-out";
}

function corregirErrores(mensajeDeValidacion, tipoDeProceso) {
  console.log(mensajeDeValidacion);
  for (const key in mensajeDeValidacion) {
    if (key !== "mensajeTextoVacio") {
      mensajeDeValidacion[key].aplicarCorreccion(textArea.value);
    }
  }

  setTimeout(() => {
    eliminarMensajeValidacion();
    procesarTexto(tipoDeProceso);
  }, 200);
}

//se lanza un error

function crearMensajeDeValidacion(mensajeDeValidacion, tipoDeProceso) {
  //los valores del objeto de validacion se meten en array y luego se transforman en string
  //para tener estructura de HTML

  let listaDeMensajes = Object.values(mensajeDeValidacion)
    .map((mensaje) => `<li>✖️ ${mensaje.msj}</li>`)
    .join("");
  // toggleButonEncriptar(mensajeDeValidacion);

  //comprueba si no hay valor dentro del textarea
  const textoVacio = "mensajeTextoVacio" in mensajeDeValidacion;

  // crea cuadro de diálogo
  crearCuadroDeDialogo(
    textoVacio,
    listaDeMensajes,
    tipoDeProceso,
    mensajeDeValidacion
  );
}

function eliminarMensajeValidacion() {
  let dialog = document.querySelector(".caja-mensaje-validacion");
  dialog.style.animation = "salidaMensajeValidacion .3s ease-in";
  // toggleButonEncriptar(mensajeDeValidacion);
  setTimeout(() => {
    dialog.remove();
  }, 300);
}

function toggleButonEncriptar(mensajeDeValidacion) {
  let botonEncriptar = document.querySelector(".boton-encriptar");
  if (mensajeDeValidacion) {
    botonEncriptar.setAttribute("disabled", "true");
  } else {
    botonEncriptar.removeAttribute("disabled");
  }
}

function procesarTexto(tipoDeProceso) {
  let [validacionIncorrecta, mensajeDeValidacion] = validacion(textArea.value);
  let texto = textArea.value;
  if (validacionIncorrecta) {
    crearMensajeDeValidacion(mensajeDeValidacion, tipoDeProceso);
  } else {
    texto = tipoDeProceso(texto);
    insertarTextoEnCaja(texto);
    ocultarImagen();
    agregarBotonCopiar();
    panelDeTextos.style.animation = "animacion-ingresar-texto .6s ease";
    setTimeout(() => {
      panelDeTextos.style.animation = "";
    }, 700);
  }
}

function manejarCifrado() {
  procesarTexto(encriptar);
}

function manejarDescifrado() {
  procesarTexto(descifrar);
}

async function agregarBotonCopiar() {
  panelDeTextos.style.justifyContent = "space-between";
  botonCopiar.style.display = "block";
}

function descifrar(textoParaDesencriptar) {
  for (const letter in clavesDeCifrado) {
    const regex = new RegExp(`${clavesDeCifrado[letter]}`, "g");
    if (textoParaDesencriptar.includes(clavesDeCifrado[letter])) {
      textoParaDesencriptar = textoParaDesencriptar.replace(regex, letter);
    }
  }

  return textoParaDesencriptar;
}
