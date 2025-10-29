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
    "106": "tudn", "107": "canal-5", "108": "azteca-7", "109": "vtv-plus", "111": "liga-1",
    "112": "de-bundliga2", "113": "de-bundliga3", "114": "de-bundliga4", "115": "de-bundliga5",
    "116": "de-bundliga6", "117": "de-bundliga7", "118": "de-bundliga8", "119": "de-bundliga9-mix",
    "120": "de-skyde-pl", "121": "de-skyde-f1", "122": "de-skyde-tennis", "123": "de-dazn-1",
    "124": "de-dazn-2", "125": "de-sportdigital-fussball", "126": "tnt", "127": "uk-sky-main",
    "128": "uk-sky-foot", "129": "uk-epl-3pm", "130": "uk-epl-3pm", "131": "uk-epl-3pm",
    "132": "uk-epl-3pm", "133": "uk-epl-3pm", "134": "uk-f1", "135": "uk-spfl", "136": "uk-spfl",
    "137": "it-dazn", "138": "it-skycalcio", "139": "it-feed", "140": "it-feed", "143": "espn",
    "144": "pt-sport-1", "145": "pt-sport-2", "146": "pt-sport-3", "147": "pt-btv", "148": "gr-sport-1",
    "149": "gr-sport-2", "150": "gr-sport-3", "151": "tr-bein-sport-1", "152": "tr-bein-sport-2",
    "153": "be-channel1", "154": "be-channel2", "155": "extra-sport1", "156": "extra-sport2",
    "157": "extra-sport3", "158": "extra-sport4", "159": "extra-sport5", "160": "extra-sport6",
    "161": "extra-sport7", "162": "extra-sport8", "163": "extra-sport9", "164": "extra-sport10",
    "165": "extra-sport11", "166": "extra-sport12", "167": "extra-sport13", "168": "extra-sport14",
    "169": "extra-sport15", "170": "extra-sport16", "171": "extra-sport17", "172": "extra-sport18",
    "173": "extra-sport19", "174": "extra-sport20", "175": "extra-sport21", "176": "extra-sport22",
    "177": "extra-sport23", "178": "extra-sport24", "179": "extra-sport25", "180": "extra-sport26",
    "181": "extra-sport27", "182": "extra-sport28", "183": "extra-sport30", "184": "extra-sport31",
    "185": "extra-sport32", "186": "extra-sport33", "187": "extra-sport34", "188": "extra-sport35",
    "189": "extra-sport36", "190": "extra-sport37", "191": "extra-sport38", "192": "extra-sport39",
    "193": "extra-sport40", "194": "extra-sport41", "195": "extra-sport42", "196": "extra-sport43",
    "197": "extra-sport44", "198": "extra-sport45", "199": "extra-sport46", "200": "extra-sport47"
};

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
            
            // Filtrar solo transmisiones relevantes:
            // - Partidos que empezaron hace menos de 2 horas (pueden estar en curso)
            // - Partidos que empiezan en las próximas 8 horas
            const ahora = new Date();
            const dosHorasAtras = new Date(ahora.getTime() - (2 * 60 * 60 * 1000));
            const treHorasDespues = new Date(ahora.getTime() + (8 * 60 * 60 * 1000));
            
            this.transmisiones = data.transmisiones
                .filter(t => {
                    const fechaPartido = this.parsearFecha(t.fechaHora);
                    // Solo partidos entre 2 horas atrás y 3 horas adelante
                    return fechaPartido && 
                           fechaPartido >= dosHorasAtras && 
                           fechaPartido <= treHorasDespues;
                })
                .slice(0, 12); // Máximo 12 partidos
            
            this.renderizarTransmisiones();
            
            console.log('✅ Transmisiones cargadas:', this.transmisiones.length, 
                       `(entre ${dosHorasAtras.toLocaleTimeString()} y ${treHorasDespues.toLocaleTimeString()})`, 
                       this.transmisiones.slice(0, 3).map(t => t.evento));
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
        // En lugar de abrir en nueva ventana, usar el modal system
        const transmision = this.transmisiones.find(t => {
            return t.canales.some(c => {
                const num = this.extraerNumeroCanal(c.numero);
                return num === numeroCanal;
            });
        });
        
        if (transmision) {
            watchTransmission(transmision);
        } else {
            console.warn(`Transmisión con canal ${numeroCanal} no encontrada`);
            alert(`Canal ${numeroCanal} no disponible en este momento`);
        }
    }

    verTransmision(transmision) {
        watchTransmission(transmision);
    }

    crearTarjetaPartido(transmision) {
        const fechaPartido = this.parsearFecha(transmision.fechaHora);
        const estado = this.obtenerEstadoPartido(fechaPartido);
        const nombrePartido = this.formatearNombrePartido(transmision.evento);
        const liga = this.obtenerLiga(transmision.evento);
        
        const card = document.createElement('div');
        card.className = 'transmision-card';
        
        // Procesar canales
        const canales = transmision.canales.map(c => this.extraerNumeroCanal(c.numero)).filter(c => c);
        
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

// ============================================
// FUNCIONES GLOBALES PARA MODALES DE ULTRA
// ============================================

let currentTransmission = null;

function watchTransmission(transmisionData) {
    currentTransmission = transmisionData;
    openStreamOptionsModal();
}

function openStreamOptionsModal() {
    if (!currentTransmission) return;
    
    const modal = document.getElementById('streamOptionsModal');
    const matchName = document.getElementById('streamMatchName');
    const optionsGrid = document.getElementById('streamOptionsGrid');
    
    const nombrePartido = formatMatchName(currentTransmission.evento);
    matchName.textContent = nombrePartido;
    
    optionsGrid.innerHTML = '';
    
    currentTransmission.canales.forEach((canal, index) => {
        const channelGroup = document.createElement('div');
        channelGroup.className = 'stream-channel-group';
        
        const numeroCanal = canal.numero.replace(/[a-z]+$/i, '');
        
        channelGroup.innerHTML = `
            <div class="channel-name">
                <i class="fas fa-satellite-dish"></i>
                <h4>${canal.nombre || `Canal ${numeroCanal}`}</h4>
                <span class="channel-number">CH ${numeroCanal}</span>
            </div>
            <div class="stream-links">
                ${Object.entries(canal.links).map(([provider, url]) => `
                    <button class="stream-link-btn" onclick="selectStreamOption('${url}')">
                        <div class="stream-link-icon">
                            <i class="fas ${getProviderIcon(provider)}"></i>
                        </div>
                        <span class="stream-link-name">${provider.toUpperCase()}</span>
                        <span class="stream-link-quality">HD</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        optionsGrid.appendChild(channelGroup);
    });
    
    modal.classList.add('active');
}

function getProviderIcon(provider) {
    const icons = {
        'hoca': 'fa-play-circle',
        'caster': 'fa-broadcast-tower',
        'wigi': 'fa-wifi'
    };
    return icons[provider] || 'fa-tv';
}

function formatMatchName(evento) {
    let nombre = evento;
    const partes = evento.split(':');
    if (partes.length > 1) {
        nombre = partes.slice(1).join(':').trim();
    }
    nombre = nombre.replace(/\s+vs\.?\s+/i, ' vs ');
    return nombre;
}

function selectStreamOption(streamUrl) {
    closeStreamOptionsModal();
    openVideoPlayer(streamUrl);
}

function openVideoPlayer(streamUrl) {
    const playerModal = document.getElementById('videoPlayerModal');
    const iframe = document.getElementById('videoPlayerIframe');
    
    iframe.src = streamUrl;
    playerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoPlayer() {
    const playerModal = document.getElementById('videoPlayerModal');
    const iframe = document.getElementById('videoPlayerIframe');
    
    iframe.src = '';
    playerModal.classList.remove('active');
    document.body.style.overflow = '';
}

function toggleFullscreen() {
    const videoContainer = document.querySelector('.video-player-container');
    
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            console.error('Error al entrar en pantalla completa:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function closeStreamOptionsModal() {
    const modal = document.getElementById('streamOptionsModal');
    modal.classList.remove('active');
    currentTransmission = null;
}

// Cerrar modal al hacer clic en overlay
document.addEventListener('DOMContentLoaded', () => {
    const streamOptionsModal = document.getElementById('streamOptionsModal');
    if (streamOptionsModal) {
        streamOptionsModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('stream-options-overlay')) {
                closeStreamOptionsModal();
            }
        });
    }
});
