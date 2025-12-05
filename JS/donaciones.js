// Variables globales
let donaciones = [];
let organizaciones = [];
const JSON_SERVER_URL = 'http://localhost:3000';


function init() {
    cargarOrganizaciones()
        .then(() => {
            generarOrganizacionesHTML();
            configurarEventos();
        })
        .catch(error => {
            alert('Error al inicializar la aplicación');
        });
}


function cargarOrganizaciones() {
    return fetch(`${JSON_SERVER_URL}/organizaciones`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            organizaciones = data;
            
            if (!organizaciones || organizaciones.length === 0) {
                throw new Error('No se encontraron organizaciones');
            }
            
            return organizaciones;
        })
        .catch(error => {
            alert('NO se pudo cargar');
            organizaciones = [];
            return [];
        });
}


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
    .catch(error => {
        alert('No se pudo guardar el trámite');
        guardarTramiteLocalmente(tramite);
        return tramite;
    });
}

/
function guardarTramiteLocalmente(tramite) {
    
        const tramitesGuardados = JSON.parse(localStorage.getItem('tramitesDonacion') || '[]');
        tramitesGuardados.push(tramite);
        localStorage.setItem('tramitesDonacion', JSON.stringify(tramitesGuardados));
   
        
    
}


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


function generarOrganizacionesHTML() {
    const contenedor = document.getElementById('organizaciones');
    contenedor.innerHTML = '';
    
    if (organizaciones.length === 0) {
        contenedor.innerHTML = '<p>No hay organizaciones disponibles</p>';
        return;
    }
    
    for (let i = 0; i < organizaciones.length; i++) {
        const orgElement = crearElementoOrganizacion(organizaciones[i]);
        contenedor.appendChild(orgElement);
    }
}


function crearElementoOrganizacion(org) {
    const div = document.createElement('div');
    div.className = 'org';
    div.setAttribute('data-id', org.id);
    
    const img = document.createElement('img');
    img.src = `../Imagenes/${org.imagen}`;
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


function configurarEventosFormulario() {
    const form = document.getElementById('form-donacion');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const radiosSocio = document.querySelectorAll('input[name="esSocio"]');
    const grupoCodigoSocio = document.getElementById('grupo-codigoSocio');
    const inputCodigoSocio = document.getElementById('codigoSocio');
    
    for (let i = 0; i < radiosSocio.length; i++) {
        radiosSocio[i].addEventListener('change', function() {
            if (this.value === 'si') {
                grupoCodigoSocio.style.display = 'block';
                inputCodigoSocio.required = true;
            } else {
                grupoCodigoSocio.style.display = 'none';
                inputCodigoSocio.required = false;
                inputCodigoSocio.value = '';
            }
        });
    }
    
    btnLimpiar.addEventListener('click', function() {
        form.reset();
        grupoCodigoSocio.style.display = 'none';
        inputCodigoSocio.required = false;
        limpiarErroresFormulario();
    });
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        limpiarErroresFormulario();
        
        const errores = validarFormularioCompleto();
        
        if (errores.length === 0) {
            procesarDonacionValida();
        } else {
            mostrarErrores(errores);
            return false;
        }
    });
}


function validarFormularioCompleto() {
    const form = document.getElementById('form-donacion');
    const errores = [];
    
    if (!form.checkValidity()) {
        const campos = ['nombre', 'apellidos', 'direccion', 'email'];
        
        for (let i = 0; i < campos.length; i++) {
            const campoId = campos[i];
            const input = document.getElementById(campoId);
            
            if (input && !input.validity.valid) {
                let mensaje = '';
                
                if (input.validity.valueMissing) {
                    mensaje = 'Este campo es obligatorio';
                } else if (campoId === 'nombre') {
                    if (input.value.length < 4) {
                        mensaje = 'El nombre debe tener al menos 4 caracteres';
                    } else if (input.value.length > 15) {
                        mensaje = 'El nombre no puede tener más de 15 caracteres';
                    }
                } else if (campoId === 'email' && input.validity.typeMismatch) {
                    mensaje = 'El formato del correo electrónico no es válido';
                }
                
                if (mensaje) {
                    errores.push({
                        campo: campoId,
                        mensaje: mensaje
                    });
                }
            }
        }
        
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
        if (!metodoPago) {
            errores.push({
                campo: 'metodoPago',
                mensaje: 'Selecciona un método de pago'
            });
        }
        
        const esSocio = document.querySelector('input[name="esSocio"]:checked');
        if (!esSocio) {
            errores.push({
                campo: 'esSocio',
                mensaje: 'Indica si tienes tarjeta de socio'
            });
        }
        
        if (esSocio && esSocio.value === 'si') {
            const codigoSocio = document.getElementById('codigoSocio');
            if (codigoSocio && !codigoSocio.validity.valid) {
                if (codigoSocio.validity.valueMissing) {
                    errores.push({
                        campo: 'codigoSocio',
                        mensaje: 'El código de socio es obligatorio'
                    });
                } else if (codigoSocio.validity.patternMismatch) {
                    errores.push({
                        campo: 'codigoSocio',
                        mensaje: 'Formato: 3 letras + 4 números + símbolo (/, _, #, &)'
                    });
                }
            }
        }
    }
    
    return errores;
}


function mostrarErrores(errores) {
    for (let i = 0; i < errores.length; i++) {
        const error = errores[i];
        const input = document.getElementById(error.campo);
        
        if (input) {
            const label = input.closest('.form-group').querySelector('label');
            if (label) {
                label.style.color = 'red';
            }
        }
    }
    
    let mensajeAlert = 'Por favor, corrige los siguientes errores:\n\n';
    for (let i = 0; i < errores.length; i++) {
        mensajeAlert += `${errores[i].mensaje}\n`;
    }
    
    alert(mensajeAlert);
}


function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombre').value.trim(),
        apellidos: document.getElementById('apellidos').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        email: document.getElementById('email').value.trim(),
        metodoPago: document.querySelector('input[name="metodoPago"]:checked')?.value || '',
        esSocio: document.querySelector('input[name="esSocio"]:checked')?.value || '',
        codigoSocio: document.getElementById('codigoSocio')?.value.trim() || ''
    };
}


function procesarDonacionValida() {
    const datosFormulario = obtenerDatosFormulario();
    mostrarVentanaConfirmacion(datosFormulario);
}


function mostrarVentanaConfirmacion(datosFormulario) {
    const contenido = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Confirmación de Donación</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; }
                .contenido { height: 180px; overflow: auto; margin-bottom: 20px; }
                .botones { text-align: center; }
                button { margin: 0 10px; padding: 10px 20px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h2>Confirmación de Donación</h2>
            <div class="contenido">
                <p><strong>Resumen de donaciones:</strong></p>
                <div>${generarResumenTexto().replace(/<br>/g, '\n')}</div>
            </div>
            <div class="botones">
                <button id="btnVolver">Volver</button>
                <button id="btnTerminar">Terminar pedido</button>
            </div>
            <script>
                document.getElementById('btnVolver').onclick = function() {
                    window.close();
                };
                
                document.getElementById('btnTerminar').onclick = function() {
                    window.opener.postMessage('terminar-pedido', '*');
                    window.close();
                };
            </script>
        </body>
        </html>
    `;
    
    const ventana = window.open(
        '', 
        'ConfirmacionDonacion',
        'width=500,height=300,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=no'
    );
    
    if (ventana) {
        ventana.document.write(contenido);
        ventana.document.close();
    } else {
        alert('Permite ventanas emergentes para continuar');
    }
}


function configurarEventos() {
    setTimeout(() => {
        const orgs = document.getElementsByClassName('org');
        for (let i = 0; i < orgs.length; i++) {
            const img = orgs[i].getElementsByTagName('img')[0];
            img.onclick = () => procesarDonacion(orgs[i]);
        }
    }, 100);
    
    configurarEventosFormulario();
}


function procesarDonacion(orgElement) {
    if (organizaciones.length === 0) {
        alert('Las organizaciones no se han cargado correctamente.');
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


function actualizarHistorial() {
    const historial = document.getElementById('historial');
    historial.innerHTML = '';

    if (donaciones.length === 0) {
        historial.innerHTML = '<p>No hay donaciones registradas...</p>';
        return;
    }

    for (let i = 0; i < donaciones.length; i++) {
        const donacion = donaciones[i];
        const linea = document.createElement('div');
        linea.className = 'linea-historial';
        linea.setAttribute('data-org', donacion.orgId);
        linea.innerHTML = `<strong>${donacion.nombre}</strong> - ${donacion.cantidad.toFixed(2)} €`;
        historial.appendChild(linea);
    }
    
    historial.scrollTop = historial.scrollHeight;
}


function resaltarLineas(orgId) {
    const lineas = document.getElementsByClassName('linea-historial');
    for (let i = 0; i < lineas.length; i++) {
        lineas[i].classList.remove('linea-destacada');
        if (parseInt(lineas[i].getAttribute('data-org')) === orgId) {
            lineas[i].classList.add('linea-destacada');
        }
    }
}


function generarResumenTexto() {
    if (donaciones.length === 0) {
        return "No hay donaciones";
    }
    
    const resumen = {};
    let total = 0;

    for (let i = 0; i < donaciones.length; i++) {
        const donacion = donaciones[i];
        if (!resumen[donacion.orgId]) {
            resumen[donacion.orgId] = { nombre: donacion.nombre, total: 0, count: 0 };
        }
        resumen[donacion.orgId].total += donacion.cantidad;
        resumen[donacion.orgId].count++;
        total += donacion.cantidad;
    }

    let html = '';
    const orgs = Object.values(resumen);
    orgs.sort((a, b) => b.nombre.localeCompare(a.nombre));

    for (let i = 0; i < orgs.length; i++) {
        const org = orgs[i];
        const media = org.total / org.count;
        html += `${org.nombre} --- ${org.count} donaciones --- ${media.toFixed(2)}€ -- ${org.total.toFixed(2)}€<br>`;
    }

    const totalRedondeado = Math.floor(total * 100) / 100;
    const mediaGeneral = total / donaciones.length;

    html += `<br><b>Aporte total: ${totalRedondeado.toFixed(2)} €</b><br>`;
    html += `<b>Aporte medio: ${mediaGeneral.toFixed(3)} €/donación</b>`;
    
    return html;
}


function limpiarErroresFormulario() {
    const labels = document.querySelectorAll('.form-group label');
    for (let i = 0; i < labels.length; i++) {
        labels[i].style.color = '';
    }
}


window.addEventListener('message', function(event) {
    if (event.data === 'terminar-pedido') {
        const datosFormulario = obtenerDatosFormulario();
        const tramite = crearEstructuraTramite(datosFormulario);
        
        guardarTramiteEnServidor(tramite)
            .then(() => {
                donaciones = [];
                document.getElementById('historial').innerHTML = '<p>No hay donaciones registradas...</p>';
                
                const inputs = document.getElementsByClassName('cantidad');
                for (let i = 0; i < inputs.length; i++) {
                    inputs[i].value = '';
                }
                
                document.getElementById('form-donacion').reset();
                document.getElementById('grupo-codigoSocio').style.display = 'none';
                limpiarErroresFormulario();
                
                alert('¡Donación realizada con éxito! Puede comenzar un nuevo pedido.');
            })
            .catch(error => {
                alert('Error al guardar la donación. Inténtelo de nuevo.');
            });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    init();
});