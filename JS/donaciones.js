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
        // Datos directos para simplificar
        this.organizaciones = [
            {id: 1, nombre: "Unicef", tipo: "personas", acogida: false, rangoEdad: "infancia"},
            {id: 2, nombre: "Médicos sin fronteras", tipo: "personas", acogida: true, rangoEdad: "infancia"},
            {id: 3, nombre: "GreenPeace", tipo: "animales", multiraza: true, ambito: "internacional"},
            {id: 4, nombre: "Cruz Roja", tipo: "personas", acogida: true, rangoEdad: "infancia"},
            {id: 5, nombre: "Save the Children", tipo: "personas", acogida: false, rangoEdad: "infancia"},
            {id: 6, nombre: "Amnistía Internacional", tipo: "personas", acogida: false, rangoEdad: "adolescencia"},
            {id: 7, nombre: "WWF", tipo: "animales", multiraza: true, ambito: "internacional"},
            {id: 8, nombre: "ACNUR", tipo: "personas", acogida: true, rangoEdad: "infancia"},
            {id: 9, nombre: "Fundación Vicente Ferrer", tipo: "personas", acogida: false, rangoEdad: "infancia"},
            {id: 10, nombre: "Manos Unidas", tipo: "personas", acogida: true, rangoEdad: "tercera edad"}
        ];
    }

    configurarEventos() {
        const orgs = document.getElementsByClassName('org');
        for (let i = 0; i < orgs.length; i++) {
            const img = orgs[i].getElementsByTagName('img')[0];
            img.onclick = () => this.procesarDonacion(orgs[i]);
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
                resumen[donacion.orgId] = {nombre: donacion.nombre, total: 0, count: 0};
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
            if (orgsIds.indexOf(this.donaciones[i].orgId) === -1) {
                orgsIds.push(this.donaciones[i].orgId);
            }
        }

        let mensaje = '';
        for (let i = 0; i < orgsIds.length; i++) {
            const org = this.organizaciones.find(o => o.id === orgsIds[i]);
            if (org.tipo === 'personas') {
                mensaje += `${org.nombre} trabaja con personas, está enfocada en la ${org.rangoEdad} y ${org.acogida ? 'sí' : 'no'} tramita acogidas.\n\n`;
            } else {
                mensaje += `${org.nombre} trabaja con ${org.multiraza ? 'todo tipo de animales' : 'una sola raza'} a nivel ${org.ambito}.\n\n`;
            }
        }

        alert("INFORMACIÓN DE ORGANIZACIONES:\n\n" + mensaje);
    }

    limpiarTodo() {
        this.donaciones = [];
        document.getElementById('historial').innerHTML = '<p><i>No hay donaciones registradas</i></p>';
        document.getElementById('resultado').innerHTML = '<p><i>Aquí aparecerá el resumen de tus donaciones</i></p>';
        
        const inputs = document.getElementsByClassName('cantidad');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
        }
    }
}

// Inicialización
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