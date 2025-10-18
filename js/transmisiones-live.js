class TransmisionesLive {
    constructor() {
        this.apiUrl = 'https://ultragol-api3.onrender.com/transmisiones';
        this.transmisiones = [];
        this.updateInterval = null;
    }

    async init() {
        await this.cargarTransmisiones();
        this.renderizarTransmisiones();
        
        // Actualizar cada 2 minutos
        this.updateInterval = setInterval(() => {
            this.cargarTransmisiones();
        }, 120000);
    }

    async cargarTransmisiones() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            // Filtrar solo transmisiones que están por empezar o en curso (próximas 3 horas)
            const ahora = new Date();
            const treHorasDespues = new Date(ahora.getTime() + (3 * 60 * 60 * 1000));
            
            this.transmisiones = data.transmisiones
                .filter(t => {
                    const fechaPartido = this.parsearFecha(t.fechaHora);
                    return fechaPartido && fechaPartido <= treHorasDespues;
                })
                .slice(0, 12); // Máximo 12 partidos
            
            this.renderizarTransmisiones();
            
            console.log('✅ Transmisiones cargadas:', this.transmisiones.length);
        } catch (error) {
            console.error('❌ Error al cargar transmisiones:', error);
            this.mostrarError();
        }
    }

    parsearFecha(fechaHoraStr) {
        try {
            // Formato: "18-10-2025 22:15"
            const [fecha, hora] = fechaHoraStr.split(' ');
            const [dia, mes, año] = fecha.split('-');
            const [horas, minutos] = hora.split(':');
            
            return new Date(año, mes - 1, dia, horas, minutos);
        } catch (error) {
            return null;
        }
    }

    extraerNumeroCanal(canalStr) {
        // Extrae el número de strings como "156es", "CH156es", etc.
        const match = canalStr.match(/(\d+)/);
        return match ? match[1] : null;
    }

    obtenerEstadoPartido(fechaPartido) {
        const ahora = new Date();
        const diff = fechaPartido - ahora;
        const minutos = Math.floor(diff / 60000);
        
        if (minutos < -90) {
            return { texto: 'Finalizado', clase: 'finalizado' };
        } else if (minutos < 0) {
            return { texto: 'EN VIVO', clase: 'en-vivo', pulso: true };
        } else if (minutos < 15) {
            return { texto: `${minutos} min`, clase: 'proximo' };
        } else if (minutos < 60) {
            return { texto: `${minutos} min`, clase: 'pronto' };
        } else {
            const horas = Math.floor(minutos / 60);
            return { texto: `${horas}h`, clase: 'programado' };
        }
    }

    formatearNombrePartido(evento) {
        // Formatea el nombre del partido para mostrar mejor
        // Elimina el nombre de la liga si está al inicio
        const ligas = ['Liga Mx', 'MLS', 'Laliga', 'Premier League', 'Serie A', 'Bundesliga', 'Ligue 1'];
        let nombre = evento;
        
        for (const liga of ligas) {
            if (evento.startsWith(liga + ' :')) {
                nombre = evento.substring(liga.length + 2).trim();
                break;
            }
        }
        
        return nombre;
    }

    obtenerLiga(evento) {
        const ligaMatch = evento.match(/^([^:]+):/);
        return ligaMatch ? ligaMatch[1].trim() : 'Fútbol';
    }

    redirigirACanal(numeroCanal) {
        // Redirige a ultracanales con el canal específico
        const url = `ULTRA/ultracanales/index.html?channel=${numeroCanal}`;
        window.open(url, '_blank');
    }

    crearTarjetaPartido(transmision) {
        const fechaPartido = this.parsearFecha(transmision.fechaHora);
        const estado = this.obtenerEstadoPartido(fechaPartido);
        const nombrePartido = this.formatearNombrePartido(transmision.evento);
        const liga = this.obtenerLiga(transmision.evento);
        
        const card = document.createElement('div');
        card.className = 'transmision-card';
        
        // Procesar canales
        const canales = transmision.canales.map(c => this.extraerNumeroCanal(c)).filter(c => c);
        
        let canalesHTML = '';
        if (canales.length === 1) {
            canalesHTML = `
                <button class="btn-ver-partido" onclick="transmisionesLive.redirigirACanal('${canales[0]}')">
                    <i class="fas fa-play-circle"></i>
                    Ver Ahora
                </button>
            `;
        } else if (canales.length > 1) {
            canalesHTML = `
                <div class="canales-opciones">
                    <button class="btn-opciones">
                        <i class="fas fa-tv"></i>
                        ${canales.length} opciones
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-canales">
                        ${canales.map((canal, idx) => `
                            <button class="canal-opcion" onclick="transmisionesLive.redirigirACanal('${canal}')">
                                <i class="fas fa-satellite-dish"></i>
                                Canal ${canal}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="transmision-header">
                <span class="transmision-liga">${liga}</span>
                <span class="transmision-estado ${estado.clase} ${estado.pulso ? 'pulso-live' : ''}">
                    ${estado.pulso ? '<span class="punto-live"></span>' : ''}
                    ${estado.texto}
                </span>
            </div>
            <div class="transmision-partido">
                <h3 class="partido-nombre">${nombrePartido}</h3>
            </div>
            <div class="transmision-info">
                <div class="info-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${transmision.fecha}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <span>${transmision.hora}</span>
                </div>
            </div>
            <div class="transmision-acciones">
                ${canalesHTML}
            </div>
        `;
        
        // Añadir evento para el dropdown si hay múltiples canales
        if (canales.length > 1) {
            setTimeout(() => {
                const btnOpciones = card.querySelector('.btn-opciones');
                const dropdown = card.querySelector('.dropdown-canales');
                
                btnOpciones?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                    
                    // Cerrar otros dropdowns
                    document.querySelectorAll('.dropdown-canales.active').forEach(d => {
                        if (d !== dropdown) d.classList.remove('active');
                    });
                });
                
                // Cerrar dropdown al hacer clic fuera
                document.addEventListener('click', () => {
                    dropdown?.classList.remove('active');
                });
            }, 0);
        }
        
        return card;
    }

    renderizarTransmisiones() {
        const container = document.getElementById('transmisiones-live-container');
        
        if (!container) return;
        
        if (this.transmisiones.length === 0) {
            container.innerHTML = `
                <div class="no-transmisiones">
                    <i class="fas fa-tv"></i>
                    <p>No hay partidos programados en este momento</p>
                    <span class="subtexto">Vuelve pronto para ver las próximas transmisiones</span>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        this.transmisiones.forEach(transmision => {
            const card = this.crearTarjetaPartido(transmision);
            container.appendChild(card);
        });
    }

    mostrarError() {
        const container = document.getElementById('transmisiones-live-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-transmisiones">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las transmisiones</p>
                <button class="btn-reintentar" onclick="transmisionesLive.cargarTransmisiones()">
                    <i class="fas fa-redo"></i>
                    Reintentar
                </button>
            </div>
        `;
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Instancia global
const transmisionesLive = new TransmisionesLive();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => transmisionesLive.init());
} else {
    transmisionesLive.init();
}
