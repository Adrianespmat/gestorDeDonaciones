class GestorDonaciones {
    constructor() {
        this.donaciones = [];
        this.organizaciones = [];
        this.init();
    }

    init() {
        this.cargarOrganizaciones();
        this.configurarEventos();
    }

    cargarOrganizaciones() {

        this.organizaciones = [
            { id: 1, nombre: "Unicef", tipo: "personas", acogida: false, rangoEdad: "infancia" },
            { id: 2, nombre: "Médicos sin fronteras", tipo: "personas", acogida: true, rangoEdad: "infancia" },
            { id: 3, nombre: "GreenPeace", tipo: "animales", multiraza: true, ambito: "internacional" },
            { id: 4, nombre: "Cruz Roja", tipo: "personas", acogida: true, rangoEdad: "infancia" },
            { id: 5, nombre: "Save the Children", tipo: "personas", acogida: false, rangoEdad: "infancia" },
            { id: 6, nombre: "Amnistía Internacional", tipo: "personas", acogida: false, rangoEdad: "adolescencia" },
            { id: 7, nombre: "WWF", tipo: "animales", multiraza: true, ambito: "internacional" },
            { id: 8, nombre: "ACNUR", tipo: "personas", acogida: true, rangoEdad: "infancia" },
            { id: 9, nombre: "Fundación Vicente Ferrer", tipo: "personas", acogida: false, rangoEdad: "infancia" },
            { id: 10, nombre: "Manos Unidas", tipo: "personas", acogida: true, rangoEdad: "tercera edad" }
        ];
    }

    configurarEventos() {
        const orgs = document.getElementsByClassName('org');
        for (let i = 0; i < orgs.length; i++) {
            const img = orgs[i].getElementsByTagName('img')[0];
            img.onclick = () => this.procesarDonacion(orgs[i]);
        }
    }

    procesarDonacion(orgElement) {
        const orgId = parseInt(orgElement.getAttribute('data-id'));
        const input = orgElement.getElementsByClassName('cantidad')[0];
        const cantidad = parseFloat(input.value);

        if (isNaN(cantidad) || cantidad <= 0) {
            alert('Introduce una cantidad mayor a 0€');
            return;
        }

        const org = this.organizaciones.find(o => o.id === orgId);
        this.donaciones.push({
            orgId: orgId,
            nombre: org.nombre,
            cantidad: cantidad,
            fechaHora: new Date()
        });

        this.actualizarHistorial();
        this.resaltarLineas(orgId);
        input.value = '';
    }


    actualizarHistorial() {
        const historial = document.getElementById('historial');
        historial.innerHTML = '';

        if (this.donaciones.length === 0) {
            historial.innerHTML = '<p>No hay donaciones registradas...</p>';
            return;
        }

        for (let i = 0; i < this.donaciones.length; i++) {
            const donacion = this.donaciones[i];
            const linea = document.createElement('div');
            linea.className = 'linea-historial';
            linea.setAttribute('data-org', donacion.orgId);
            linea.innerHTML = `<strong>${donacion.nombre}</strong> - ${donacion.cantidad.toFixed(2)} €`;
            historial.appendChild(linea);
        }
    }


    resaltarLineas(orgId) {
        const lineas = document.getElementsByClassName('linea-historial');
        for (let i = 0; i < lineas.length; i++) {
            lineas[i].classList.remove('linea-destacada');
            if (parseInt(lineas[i].getAttribute('data-org')) === orgId) {
                lineas[i].classList.add('linea-destacada');
            }
        }
    }


    finalizarDonaciones() {
        if (this.donaciones.length === 0) {
            alert('No hay donaciones');
            return;
        }

        this.mostrarResumen();
        this.mostrarInfoOrganizaciones();
        setTimeout(() => this.limpiarTodo(), 10000);
    }


    mostrarResumen() {
        const resumen = {};
        let total = 0;

        for (let i = 0; i < this.donaciones.length; i++) {
            const donacion = this.donaciones[i];
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
        const mediaGeneral = total / this.donaciones.length;

        html += `<br><b>Aporte total: ${totalRedondeado.toFixed(2)} €</b><br>`;
        html += `<b>Aporte medio: ${mediaGeneral.toFixed(3)} €/donación</b>`;

        document.getElementById('resultado').innerHTML = html;

        
    }

    mostrarInfoOrganizaciones() {

        
        const orgsIds = [];
        for (let i = 0; i < this.donaciones.length; i++) {
            if (!orgsIds.includes(this.donaciones[i].orgId)) {
                orgsIds.push(this.donaciones[i].orgId);
            }
        }

        let infoHTML = "";
        for (let i = 0; i < orgsIds.length; i++) {
            const org = this.organizaciones.find(o => o.id === orgsIds[i]);
            const numero = `1.${i + 1}`;
              if (org.tipo === 'personas') {
            infoHTML += `<p><strong>${numero}. ${org.nombre}</strong> trabaja con personas, está enfocada en la ${org.rangoEdad} y ${org.acogida ? 'sí' : 'no'} tramita acogidas.</p>`;
            } else {
                const tipoAnimales = org.multiraza ? "todo tipo de animales" : "una sola raza de animales";
            const ambito = org.ambito === "internacional" ? "mundial" : org.ambito;
            infoHTML += `<p><strong>${numero}. ${org.nombre}</strong> trabaja con ${tipoAnimales} a nivel ${ambito}.</p>`;
            }
        }

        
        const popup = window.open("", "InfoOrganizaciones", "width=600,height=400,scrollbars=yes");
    popup.document.write(`
        <html>
            <head>
                <title>Información de Organizaciones</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px;}
                    h1 { color: #444; text-align: center; }
                    .info-org { margin: 15px 0; padding: 10px; }
                    
                </style>
            </head>
            <body>
                
                <div class="info-org">
                    ${infoHTML}
                </div>
                
            </body>
        </html>
    `);
    popup.document.close();
    }

    limpiarTodo() {
        this.donaciones = [];
        document.getElementById('historial').innerHTML = '<p>No hay donaciones registradas</p>';
        document.getElementById('resultado').innerHTML = '<p>Aquí aparecerá el resumen de tus donaciones</p>';

        const inputs = document.getElementsByClassName('cantidad');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
        }
    }
}


let gestorDonaciones;

document.addEventListener('DOMContentLoaded', function() {
    gestorDonaciones = new GestorDonaciones();
});

function finalizarDonaciones() {
    if (gestorDonaciones) {
        gestorDonaciones.finalizarDonaciones();
    } else {
        alert('El sistema no se ha inicializado correctamente');
    }
}