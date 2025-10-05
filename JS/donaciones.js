let aportaciones = [];
let totalDonado = 0;

function donar(nombre, aporte) {
  // Guardar la donación
  aportaciones.push(nombre);
  totalDonado += aporte;

  
}

function finalizar() {
  if (aportaciones.length === 0) {
    alert("No has realizado ninguna donación todavía.");
    return;
  }

  // Contar aportaciones por organización
  let resumen = {};
  for (let i = 0; i < aportaciones.length; i++) {
    let org = aportaciones[i];
    if (resumen[org]) {
      resumen[org]++;
    } else {
      resumen[org] = 1;
    }
  }

  // Ordenar alfabéticamente inverso
  let nombresOrdenados = Object.keys(resumen).sort().reverse();

  // Construir texto final
  let texto = "";
  for (let i = 0; i < nombresOrdenados.length; i++) {
    let org = nombresOrdenados[i];
    texto += org + " ---- " + resumen[org] + " aportaciones<br>";
  }

  let media = (totalDonado / aportaciones.length).toFixed(2);

  texto += "<br><b>Donación final: " + totalDonado + " €</b><br>";
  texto += "<b>Donación media: " + media + " €/aportación</b>";

  document.getElementById("resultado").innerHTML = texto;

  // Reiniciar para empezar nuevas donaciones después
  aportaciones = [];
  totalDonado = 0;
}
