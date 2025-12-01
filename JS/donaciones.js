// Variables globales
let donaciones = [];
let organizaciones = [];
const JSON_SERVER_URL = 'http://localhost:3000';

// Función principal de inicialización
function init() {
    cargarOrganizaciones()
        .then(() => {
            generarOrganizacionesHTML();
            configurarEventos();
        })
        .catch(error => {
            console.error('Error en inicialización:', error);
        });
}

// Cargar organizaciones desde json-server (punto 2)
function cargarOrganizaciones() {
    return fetch(`${JSON_SERVER_URL}/organizaciones`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            organizaciones = data;
            
            if (!organizaciones || organizaciones.length === 0) {
                throw new Error('No se encontraron organizaciones en el servidor');
            }
            
            return organizaciones;
        })
        .catch(error => {
            console.error('Error al cargar las organizaciones:', error);
            alert('No se pudieron cargar las organizaciones. Por favor, verifica que json-server esté ejecutándose en http://localhost:3000');
            organizaciones = [];
            return [];
        });
}

// Función para guardar trámite en json-server (punto 2)
function guardarTramiteEnServidor(tramite) {
    return fetch(`${JSON_SERVER_URL}/tramitesDonacion`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tramite)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al guardar trámite: ${response.status}`);
        }
        return response.json();
    })
    .then(datosGuardados => {
        console.log('Trámite guardado exitosamente:', datosGuardados);
        return datosGuardados;
    })
    .catch(error => {
        console.error('Error al guardar el trámite:', error);
        alert('No se pudo guardar el trámite. Verifica que json-server esté funcionando.');
        // Guardar localmente como respaldo
        guardarTramiteLocalmente(tramite);
        return tramite;
    });
}

// Función de respaldo: guardar en localStorage
function guardarTramiteLocalmente(tramite) {
    try {
        const tramitesGuardados = JSON.parse(localStorage.getItem('tramitesDonacion') || '[]');
        tramitesGuardados.push(tramite);
        localStorage.setItem('tramitesDonacion', JSON.stringify(tramitesGuardados));
        console.log('Trámite guardado localmente:', tramite);
    } catch (error) {
        console.error('Error al guardar localmente:', error);
    }
}

// Función para crear estructura del trámite
function crearEstructuraTramite(datosFormulario = null) {
    const tramite = {
        id: Date.now(),
        fechaHora: new Date().toISOString(),
        donaciones: [...donaciones],
        resumen: generarResumenTexto()
    };
    
    if (datosFormulario) {
        tramite.datosPersonales = datosFormulario;
    }
    
    return tramite;
}

// Generar las organizaciones en el HTML dinámicamente
function generarOrganizacionesHTML() {
    const contenedor = document.getElementById('organizaciones');
    contenedor.innerHTML = '';
    
    if (organizaciones.length === 0) {
        contenedor.innerHTML = '<p>No hay organizaciones disponibles</p>';
        return;
    }
    
    organizaciones.forEach(org => {
        const orgElement = crearElementoOrganizacion(org);
        contenedor.appendChild(orgElement);
    });
}

// Crear un elemento HTML para una organización
function crearElementoOrganizacion(org) {
    const div = document.createElement('div');
    div.className = 'org';
    div.setAttribute('data-id', org.id);
    
    const nombreImagen = org.imagen || obtenerNombreImagen(org.nombre);
    
    const img = document.createElement('img');
    img.src = `../Imagenes/${nombreImagen}`;
    img.alt = org.nombre;
    img.title = `Donar a ${org.nombre}`;
    
    const p = document.createElement('p');
    p.textContent = org.nombre;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'cantidad';
    input.placeholder = 'Cantidad';
    
    div.appendChild(img);
    div.appendChild(p);
    div.appendChild(input);
    
    return div;
}

// Mapear nombres de organizaciones a nombres de archivo 
function obtenerNombreImagen(nombreOrg) {
    const mapeoImagenes = {
        "Unicef": "unicef.png",
        "Médicos sin fronteras": "medicos.png",
        "GreenPeace": "greenpeace.png",
        "Cruz Roja": "cruz roja.png",
        "Save the Children": "saveChildren.png",
        "Amnistía Internacional": "amnistia.png",
        "WWF": "wwf.png",
        "ACNUR": "acnur.png",
        "Fundación Vicente Ferrer": "fundacion.png",
        "Manos Unidas": "manosUNidads.jpg"
    };
    
    return mapeoImagenes[nombreOrg] || `${nombreOrg.toLowerCase().replace(/\s+/g, '_')}.png`;
}


// Configurar eventos de las imágenes Y del formulario
function configurarEventos() {
    // Eventos para imágenes de organizaciones
    setTimeout(() => {
        const orgs = document.getElementsByClassName('org');
        for (let i = 0; i < orgs.length; i++) {
            const img = orgs[i].getElementsByTagName('img')[0];
            img.onclick = () => procesarDonacion(orgs[i]);
        }
    }, 100);
    
    // Eventos del formulario (PUNTO 3)
    configurarEventosFormulario();
}

// Procesar una donación
function procesarDonacion(orgElement) {
    if (organizaciones.length === 0) {
        alert('Las organizaciones no se han cargado correctamente. Por favor, recarga la página.');
        return;
    }
    
    const orgId = parseInt(orgElement.getAttribute('data-id'));
    const input = orgElement.getElementsByClassName('cantidad')[0];
    const cantidad = parseFloat(input.value);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert('Introduce una cantidad mayor a 0€');
        return;
    }

    const org = organizaciones.find(o => o.id === orgId);
    
    if (!org) {
        alert('Organización no encontrada');
        return;
    }
    
    donaciones.push({
        orgId: orgId,
        nombre: org.nombre,
        cantidad: cantidad,
        fechaHora: new Date()
    });

    actualizarHistorial();
    resaltarLineas(orgId);
    input.value = '';
}

// Actualizar el historial de donaciones
function actualizarHistorial() {
    const historial = document.getElementById('historial');
    historial.innerHTML = '';

    if (donaciones.length === 0) {
        historial.innerHTML = '<p>No hay donaciones registradas...</p>';
        return;
    }

    donaciones.forEach(donacion => {
        const linea = document.createElement('div');
        linea.className = 'linea-historial';
        linea.setAttribute('data-org', donacion.orgId);
        linea.innerHTML = `<strong>${donacion.nombre}</strong> - ${donacion.cantidad.toFixed(2)} €`;
        historial.appendChild(linea);
    });
    
    historial.scrollTop = historial.scrollHeight;
}

// Resaltar líneas del historial
function resaltarLineas(orgId) {
    const lineas = document.getElementsByClassName('linea-historial');
    for (let i = 0; i < lineas.length; i++) {
        lineas[i].classList.remove('linea-destacada');
        if (parseInt(lineas[i].getAttribute('data-org')) === orgId) {
            lineas[i].classList.add('linea-destacada');
        }
    }
}

// Función para generar resumen de donaciones
function generarResumenTexto() {
    if (donaciones.length === 0) {
        return "No hay donaciones";
    }
    
    const resumen = {};
    let total = 0;

    donaciones.forEach(donacion => {
        if (!resumen[donacion.orgId]) {
            resumen[donacion.orgId] = { nombre: donacion.nombre, total: 0, count: 0 };
        }
        resumen[donacion.orgId].total += donacion.cantidad;
        resumen[donacion.orgId].count++;
        total += donacion.cantidad;
    });

    let html = '';
    const orgs = Object.values(resumen);
    orgs.sort((a, b) => b.nombre.localeCompare(a.nombre));

    orgs.forEach(org => {
        const media = org.total / org.count;
        html += `${org.nombre} --- ${org.count} donaciones --- ${media.toFixed(2)}€ -- ${org.total.toFixed(2)}€<br>`;
    });

    const totalRedondeado = Math.floor(total * 100) / 100;
    const mediaGeneral = total / donaciones.length;

    html += `<br><b>Aporte total: ${totalRedondeado.toFixed(2)} €</b><br>`;
    html += `<b>Aporte medio: ${mediaGeneral.toFixed(3)} €/donación</b>`;
    
    return html;
}

// Función para mostrar información de organizaciones (PUNTO 1.5)
function mostrarInfoOrganizaciones() {
    // Esta función se modificará según lo indicado en puntos posteriores
    console.log("Función mostrarInfoOrganizaciones() - Se modificará según puntos posteriores del enunciado");
}

// Función para limpiar todo
function limpiarTodo() {
    donaciones = [];
    document.getElementById('historial').innerHTML = '<p>No hay donaciones registradas...</p>';

    const inputs = document.getElementsByClassName('cantidad');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
}

// Inicializar cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    init();
});