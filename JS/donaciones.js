// Organizaciones con sus aportes fijos
let organizaciones = [
  { nombre: "Unicef", aporte: 20 },
  { nombre: "Médicos sin fronteras", aporte: 15 },
  { nombre: "GreenPeace", aporte: 25 },
  { nombre: "Cruz Roja", aporte: 10 },
  { nombre: "Save the Children", aporte: 30 },
  { nombre: "Amnistía Internacional", aporte: 12 },
  { nombre: "WWF", aporte: 18 },
  { nombre: "ACNUR", aporte: 22 },
  { nombre: "Fundación Vicente Ferrer", aporte: 14 },
  { nombre: "Manos Unidas", aporte: 16 }
];

// Array y contador
let aportaciones = []; 
let totalDonado = 0;

// Muestra organizaciones
function cargarOrganizaciones() {
  let cont = document.getElementById("organizaciones");
  cont.innerHTML = "";
  for (let i = 0; i < organizaciones.length; i++) {
    cont.innerHTML += `
      <div onclick="donar(${i})">
        <img src="https://via.placeholder.com/100" alt="${organizaciones[i].nombre}">
        <p>${organizaciones[i].nombre}</p>
        <p>Aporte fijo: ${organizaciones[i].aporte} €</p>
      </div>
    `;
  }
}

// Función al donar
function donar(indice) {
  let resultado = document.getElementById("resultado");
  if (resultado.innerHTML.trim() !== "" && !resultado.innerHTML.includes("Aparecerá")) {
    resultado.innerHTML = "<p><i>Aquí aparecerá el resumen de tus donaciones...</i></p>";
    aportaciones = [];
    totalDonado = 0;
  }

  let org = organizaciones[indice];
  aportaciones.push(org.nombre);
  totalDonado += org.aporte;
  alert("Has donado " + org.aporte + " € a " + org.nombre);
}


