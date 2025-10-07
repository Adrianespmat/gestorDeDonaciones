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
  let i = 0;
  while (i < aportaciones.length) {
    let org = aportaciones[i];
    if (resumen[org]) {
      resumen[org]++;
    } else {
      resumen[org] = 1;
    }
    i++;
  }

  // Ordenar nombres alfabéticamente
  let nombresOrdenados = Object.keys(resumen).sort().reverse();

  // Construir texto final
  let texto = "";
  let j = 0;
  while (j < nombresOrdenados.length) {
    let org = nombresOrdenados[j];
    texto += org + " ---- " + resumen[org] + " aportaciones<br>";
    j++;
  }

  let media = (totalDonado / aportaciones.length).toFixed();

  texto += "<br><b>Donación final: " + totalDonado + " €</b><br>";
  texto += "<b>Donación media: " + media + " €/aportación</b>";

  document.getElementById("resultado").innerHTML = texto;

  // Reiniciar para empezar nuevas donaciones despues
  aportaciones = [];
  totalDonado = 0;
}
