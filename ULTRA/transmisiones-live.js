// Mapeo de números de canal a IDs en ultracanales
const CANAL_ID_MAP = {
    "1": "bein-1", "2": "bein-2", "3": "bein-3", "4": "bein-max-4", "5": "bein-max-5",
    "6": "bein-max-6", "7": "bein-max-7", "8": "bein-max-8", "9": "bein-max-9", "10": "bein-max-10",
    "12": "canal-foot", "13": "canal-sport", "14": "canal-sport360", "15": "eurosport1", "16": "eurosport2",
    "17": "rmc-sport1", "18": "rmc-sport2", "19": "equipe", "20": "ligue-1-fr", "21": "ligue-1-fr",
    "22": "ligue-1-fr", "23": "automoto", "24": "tf1", "25": "tmc", "26": "m6", "27": "w9",
    "28": "france2", "29": "france3", "30": "france4", "31": "clive-1", "32": "clive-2",
    "33": "clive-3", "34": "clive-4", "35": "clive-5", "36": "clive-6", "37": "clive-7",
    "38": "clive-8", "39": "clive-9", "40": "clive-10", "41": "clive-11", "42": "clive-12",
    "43": "clive-13", "44": "clive-14", "45": "clive-15", "46": "clive-16", "47": "clive-17",
    "48": "clive-18", "49": "es-mlaliga", "50": "es-mlaliga2", "51": "es-dazn-liga", "52": "es-dazn-liga2",
    "53": "es-laliga-hypermotion", "54": "es-laliga-hypermotion2", "55": "es-vamos", "56": "es-dazn-1",
    "57": "es-dazn-2", "58": "es-dazn-3", "59": "es-dazn-4", "60": "dazn-f1", "61": "es-m-liga-de-campeones",
    "62": "es-m-deportes", "63": "es-m-deportes2", "64": "es-m-deportes3", "65": "es-m-deportes4",
    "66": "es-m-deportes5", "67": "es-m-deportes6", "69": "bein-en-espaol", "70": "fox-deportes",
    "72": "nbc-universo", "73": "telemundo51", "74": "gol-espaol", "77": "tyc-sports", "78": "foxsport1-arg",
    "79": "foxsport2-arg", "80": "foxsport3-arg", "82": "win-sports-plus", "85": "gol-peru",
    "86": "zapping-sports", "91": "espn-5-mexico", "94": "directv", "95": "directv2", "96": "directv",
    "98": "espn-2-mexico", "99": "espn-3-mexico", "100": "espn-4-mexico", "101": "foxsport1mx",
    "102": "foxsport2mx", "103": "foxsport3mx", "104": "fox-sports", "105": "tvc-deportes",
    "106": "tudn", "107": "canal-5", "108": "azteca-7", "109": "vtv-plus", "111": "liga-1"
};

class TransmisionesLiveUltra {
    constructor() {
        this.apiUrl = 'https://ultragol-api3.onrender.com/transmisiones';
        this.transmisiones = [];
        this.transmisionesFiltradas = [];
        this.ligaActual = 'Liga MX';
        this.updateInterval = null;
    }

    async init() {
        await this.cargarTransmisiones();
        this.renderizarTransmisiones();
        this.setupLeagueFilters();
        
        // Actualizar cada 2 minutos
        this.updateInterval = setInterval(() => {
            this.cargarTransmisiones();
        }, 120000);
    }

    setupLeagueFilters() {
        const leagueBtns = document.querySelectorAll('.league-btn');
        leagueBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                leagueBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const leagueName = btn.querySelector('span').textContent;
                this.filtrarPorLiga(leagueName);
                
                if (typeof currentLeague !== 'undefined') {
                    currentLeague = leagueName;
                }
                
                if (typeof loadMatchesByLeague === 'function') {
                    await loadMatchesByLeague(leagueName);
                }
            });
        });
    }

    async cargarTransmisiones() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            const ahora = new Date();
            const dosHorasAtras = new Date(ahora.getTime() - (2 * 60 * 60 * 1000));
            const tresHorasDespues = new Date(ahora.getTime() + (3 * 60 * 60 * 1000));
            
            this.transmisiones = data.transmisiones
                .filter(t => {
                    const fechaPartido = this.parsearFecha(t.fechaHora);
                    return fechaPartido && 
                           fechaPartido >= dosHorasAtras && 
                           fechaPartido <= tresHorasDespues;
                });
            
            this.filtrarPorLiga(this.ligaActual);
            
            console.log('✅ Transmisiones cargadas:', this.transmisiones.length);
        } catch (error) {
            console.error('❌ Error al cargar transmisiones:', error);
            this.mostrarError();
        }
    }

    filtrarPorLiga(liga) {
        this.ligaActual = liga;
        
        // Mapeo de nombres de ligas
        const ligaMap = {
            'Liga MX': 'Liga Mx',
            'Premier League': 'Premier League',
            'La Liga': 'Laliga',
            'Serie A': 'Serie A',
            'Bundesliga': 'Bundesliga',
            'Ligue 1': 'Ligue 1',
            'MLS': 'MLS',
            'Liga Pro': 'Liga Pro'
        };
        
        if (liga === 'todas' || !liga) {
            this.transmisionesFiltradas = this.transmisiones;
        } else {
            const ligaNombre = ligaMap[liga] || liga;
            this.transmisionesFiltradas = this.transmisiones.filter(t => {
                return t.evento && t.evento.toLowerCase().includes(ligaNombre.toLowerCase());
            });
        }
        
        console.log(`🔍 Filtrado por ${liga}:`, this.transmisionesFiltradas.length, 'partidos');
        this.renderizarTransmisiones();
    }

    parsearFecha(fechaHoraStr) {
        try {
            const [fecha, hora] = fechaHoraStr.split(' ');
            const [dia, mes, año] = fecha.split('-');
            const [horas, minutos] = hora.split(':');
            
            return new Date(año, mes - 1, dia, horas, minutos);
        } catch (error) {
            return null;
        }
    }

    extraerNumeroCanal(canalStr) {
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
            return { texto: `En ${minutos} min`, clase: 'proximo' };
        } else if (minutos < 60) {
            return { texto: `${minutos} min`, clase: 'pronto' };
        } else {
            const horas = Math.floor(minutos / 60);
            return { texto: `${horas}h`, clase: 'programado' };
        }
    }

    formatearNombrePartido(evento) {
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
        const canalId = CANAL_ID_MAP[numeroCanal];
        
        if (canalId) {
            const url = `ultracanales/canales.html?channel=${canalId}`;
            window.open(url, '_blank');
        } else {
            console.warn(`Canal ${numeroCanal} no encontrado en el mapeo`);
            showToast(`Canal ${numeroCanal} no disponible en este momento`);
        }
    }

    crearTarjetaPartido(transmision) {
        const fechaPartido = this.parsearFecha(transmision.fechaHora);
        const estado = this.obtenerEstadoPartido(fechaPartido);
        const nombrePartido = this.formatearNombrePartido(transmision.evento);
        const liga = this.obtenerLiga(transmision.evento);
        
        const card = document.createElement('div');
        card.className = 'match-card live-match';
        
        const canales = transmision.canales.map(c => this.extraerNumeroCanal(c)).filter(c => c);
        
        const primeraOpcion = canales.length > 0 ? canales[0] : null;
        
        card.innerHTML = `
            <div class="match-card-bg">
                <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600" alt="Match">
            </div>
            <div class="match-card-content">
                <div class="live-badge-small ${estado.pulso ? 'pulse' : ''}">
                    ${estado.pulso ? '<span class="live-dot-small"></span>' : ''}
                    ${estado.texto}
                </div>
                <div class="match-league-tag">${liga}</div>
                <h3 class="match-name">${nombrePartido}</h3>
                <div class="match-time">
                    <i class="fas fa-clock"></i> ${transmision.hora}
                </div>
                ${primeraOpcion ? `
                    <button class="watch-btn" onclick="transmisionesLiveUltra.redirigirACanal('${primeraOpcion}')">
                        <i class="fas fa-play-circle"></i>
                        <span>VER AHORA</span>
                    </button>
                ` : `
                    <button class="watch-btn disabled">
                        <span>Sin señal disponible</span>
                    </button>
                `}
                ${canales.length > 1 ? `
                    <div class="more-channels">
                        <button class="btn-more-channels" onclick="event.stopPropagation(); this.nextElementSibling.classList.toggle('active')">
                            <i class="fas fa-tv"></i>
                            ${canales.length} opciones de transmisión
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="channels-dropdown">
                            ${canales.map(canal => `
                                <button class="channel-option" onclick="transmisionesLiveUltra.redirigirACanal('${canal}')">
                                    <i class="fas fa-satellite-dish"></i>
                                    Canal ${canal}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        return card;
    }

    renderizarTransmisiones() {
        const container = document.getElementById('liveMatches');
        
        if (!container) return;
        
        if (this.transmisionesFiltradas.length === 0) {
            container.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-tv" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>No hay partidos ${this.ligaActual !== 'todas' ? 'de ' + this.ligaActual : ''} en vivo en este momento</p>
                    <span style="opacity: 0.7; font-size: 14px;">Vuelve pronto para ver las próximas transmisiones</span>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        this.transmisionesFiltradas.slice(0, 12).forEach(transmision => {
            const card = this.crearTarjetaPartido(transmision);
            container.appendChild(card);
        });
    }

    mostrarError() {
        const container = document.getElementById('liveMatches');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las transmisiones</p>
                <button class="watch-btn" onclick="transmisionesLiveUltra.cargarTransmisiones()">
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
const transmisionesLiveUltra = new TransmisionesLiveUltra();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => transmisionesLiveUltra.init());
} else {
    transmisionesLiveUltra.init();
}
