let currentStreamUrl = '';
let activeTab = 'live';
let currentLeague = 'Liga MX';
let marcadoresData = null;
let transmisionesData = null;
let updateInterval = null;
let currentFeaturedIndex = 0;
let featuredMatches = [];
let touchStartX = 0;
let touchEndX = 0;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    await loadMarcadores();
    await loadTransmisiones();
    startAutoUpdate();
    await loadStandings();
    await loadNews();
});

// Función principal para cargar marcadores desde la API
async function loadMarcadores() {
    try {
        const endpoint = leagueEndpoints[currentLeague]?.marcadores || '/marcadores';
        const response = await fetch(`https://ultragol-api3.onrender.com${endpoint}`);
        const data = await response.json();
        marcadoresData = data;

        console.log(`✅ Marcadores de ${currentLeague} cargados:`, data);

        // Actualizar featured match
        updateFeaturedMatch(data);

        // Actualizar partidos según la pestaña activa
        if (activeTab === 'live') {
            updateLiveMatches(data);
        } else if (activeTab === 'upcoming') {
            updateUpcomingMatches(data);
        }

        return data;
    } catch (error) {
        console.error(`❌ Error cargando marcadores de ${currentLeague}:`, error);
        // Mostrar mensaje de error en lugar de fallar silenciosamente
        const container = activeTab === 'live' ? document.getElementById('liveMatches') : document.getElementById('upcomingMatches');
        if (container) {
            container.innerHTML = `
                <div class="no-matches" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚽</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 18px; margin-bottom: 8px;">No hay marcadores disponibles</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 14px;">Los marcadores de ${currentLeague} estarán disponibles próximamente</div>
                </div>
            `;
        }
        return null;
    }
}

// Función para cargar transmisiones desde la API
async function loadTransmisiones() {
    try {
        const endpoint = leagueEndpoints[currentLeague]?.transmisiones || '/transmisiones';
        const response = await fetch(`https://ultragol-api3.onrender.com${endpoint}`);
        const data = await response.json();
        transmisionesData = data;

        console.log(`✅ Transmisiones de ${currentLeague} cargadas:`, data);
        return data;
    } catch (error) {
        console.error(`❌ Error cargando transmisiones de ${currentLeague}:`, error);
        return null;
    }
}

// Actualizar el carrusel del partido destacado con TODOS los partidos
function updateFeaturedMatch(data) {
    if (!data || !data.partidos || data.partidos.length === 0) return;

    const carousel = document.getElementById('featuredCarousel');
    if (!carousel) return;

    // Preservar la posición actual del usuario
    const previousMatchId = featuredMatches[currentFeaturedIndex]?.id;

    // Guardar todos los partidos para el carrusel
    featuredMatches = data.partidos;

    // Intentar mantener el mismo partido que el usuario estaba viendo
    if (previousMatchId) {
        const matchIndex = featuredMatches.findIndex(p => p.id === previousMatchId);
        if (matchIndex !== -1) {
            // El partido todavía existe, mantener la posición
            currentFeaturedIndex = matchIndex;
        } else {
            // El partido ya no existe, resetear a 0
            currentFeaturedIndex = 0;
        }
    } else {
        // Primera carga, empezar en 0
        currentFeaturedIndex = 0;
    }

    // Crear un slide para cada partido
    carousel.innerHTML = featuredMatches.map((partido, index) => {
        const hora = formatearHora(partido.fecha);
        const isActive = index === currentFeaturedIndex ? 'active' : '';

        // Determinar el badge apropiado
        let liveBadgeHTML = '';
        if (partido.estado?.enVivo) {
            liveBadgeHTML = `
                <div class="live-badge">
                    <span class="live-dot"></span>
                    <span>EN VIVO - ${partido.reloj}</span>
                </div>
            `;
        } else if (partido.estado?.programado) {
            liveBadgeHTML = `
                <div class="live-badge" style="background: rgba(255, 165, 0, 0.95);">
                    <span class="live-dot" style="background: #ffa500;"></span>
                    <span>${hora}</span>
                </div>
            `;
        } else if (partido.estado?.finalizado) {
            liveBadgeHTML = `
                <div class="live-badge" style="background: rgba(128, 128, 128, 0.95);">
                    <i class="fas fa-check-circle"></i>
                    <span>FINALIZADO</span>
                </div>
            `;
        }

        return `
            <div class="featured-match ${isActive}" data-index="${index}">
                <div class="match-overlay"></div>
                <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800" alt="Stadium" class="match-bg">

                <div class="match-score">
                    <div class="team-logo">
                        <img src="${partido.local.logo}" alt="${partido.local.nombreCorto}" onerror="this.src='https://via.placeholder.com/50'">
                    </div>
                    <div class="score-display">
                        <span class="score">${partido.local.marcador} - ${partido.visitante.marcador}</span>
                    </div>
                    <div class="team-logo">
                        <img src="${partido.visitante.logo}" alt="${partido.visitante.nombreCorto}" onerror="this.src='https://via.placeholder.com/50'">
                    </div>
                </div>

                <div class="match-info">
                    <div class="match-time-display">
                        <i class="far fa-clock"></i> ${hora}
                    </div>
                    <h2 class="match-title">${partido.local.nombreCorto} vs. ${partido.visitante.nombreCorto}</h2>
                    <div class="match-badges">
                        <span class="badge-icon" title="Marcador"><i class="fas fa-circle"></i></span>
                        <span class="badge-icon" title="Estadio: ${partido.estadio || 'TBD'}"><i class="fas fa-users"></i></span>
                        <span class="badge-icon" title="Transmisión"><i class="fas fa-wifi"></i></span>
                    </div>
                </div>

                ${liveBadgeHTML}
            </div>
        `;
    }).join('');

    // Actualizar indicadores
    updateCarouselIndicators();

    // Mostrar/ocultar botones de navegación según cantidad de partidos
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    if (featuredMatches.length > 1) {
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    } else {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }

    // Agregar soporte para swipe táctil
    initTouchSupport();
}

// Actualizar indicadores del carrusel
function updateCarouselIndicators() {
    const indicatorsContainer = document.getElementById('carouselIndicators');
    if (!indicatorsContainer) return;

    if (featuredMatches.length <= 1) {
        indicatorsContainer.innerHTML = '';
        return;
    }

    indicatorsContainer.innerHTML = featuredMatches.map((_, index) => {
        const isActive = index === currentFeaturedIndex ? 'active' : '';
        return `<span class="indicator ${isActive}" onclick="goToFeaturedMatch(${index})"></span>`;
    }).join('');
}

// Navegar al siguiente partido
function nextFeaturedMatch() {
    if (currentFeaturedIndex < featuredMatches.length - 1) {
        currentFeaturedIndex++;
        updateCarouselPosition();
    }
}

// Navegar al partido anterior
function prevFeaturedMatch() {
    if (currentFeaturedIndex > 0) {
        currentFeaturedIndex--;
        updateCarouselPosition();
    }
}

// Ir a un partido específico
function goToFeaturedMatch(index) {
    if (index >= 0 && index < featuredMatches.length) {
        currentFeaturedIndex = index;
        updateCarouselPosition();
    }
}

// Actualizar posición del carrusel
function updateCarouselPosition() {
    const slides = document.querySelectorAll('.featured-match');
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentFeaturedIndex) {
            slide.classList.add('active');
        }
    });

    updateCarouselIndicators();
}

// Inicializar soporte táctil para swipe
function initTouchSupport() {
    const carousel = document.getElementById('featuredCarousel');
    if (!carousel) return;

    // Remover listeners anteriores si existen
    carousel.removeEventListener('touchstart', handleTouchStart);
    carousel.removeEventListener('touchend', handleTouchEnd);

    // Agregar nuevos listeners
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// Manejar inicio de touch
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

// Manejar fin de touch
function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}

// Detectar gesto de swipe
function handleSwipeGesture() {
    const swipeThreshold = 50; // Mínimo de píxeles para considerar swipe

    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe izquierda - siguiente partido
        nextFeaturedMatch();
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe derecha - partido anterior
        prevFeaturedMatch();
    }
}

// Actualizar partidos en vivo
function updateLiveMatches(data) {
    const container = document.getElementById('liveMatches');
    if (!container) return;

    const partidosEnVivo = data.partidos.filter(p => {
        return p.estado?.enVivo || 
               (!p.estado?.finalizado && !p.estado?.programado && p.reloj && p.reloj !== '0\'');
    });

    if (partidosEnVivo.length === 0) {
        container.innerHTML = `
            <div class="no-matches" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚽</div>
                <div style="color: rgba(255,255,255,0.8); font-size: 18px; margin-bottom: 8px;">No hay partidos de ${currentLeague} en vivo</div>
                <div style="color: rgba(255,255,255,0.5); font-size: 14px;">Revisa la sección UPCOMING para próximos partidos</div>
            </div>
        `;
        return;
    }

    container.innerHTML = partidosEnVivo.map(partido => renderLiveMatchCard(partido)).join('');
}

// Renderizar tarjeta de partido en vivo
function renderLiveMatchCard(partido) {
    const golesInfo = renderGolesInfo(partido);

    return `
        <div class="match-card live-match-card">
            <div class="match-card-bg-compact">
                <img src="assets/ultragol-banner.jpg" alt="ULTRAGOL">
            </div>
            <div class="match-card-content-modern">
                <div class="teams-modern">
                    <div class="team-modern">
                        <img src="${partido.local.logo}" alt="${partido.local.nombreCorto}" class="team-badge-large" onerror="this.src='https://via.placeholder.com/50'">
                        <span>${partido.local.nombreCorto}</span>
                    </div>
                    <div class="team-modern">
                        <img src="${partido.visitante.logo}" alt="${partido.visitante.nombreCorto}" class="team-badge-large" onerror="this.src='https://via.placeholder.com/50'">
                        <span>${partido.visitante.nombreCorto}</span>
                    </div>
                </div>
                <div class="match-score-modern">
                    <span class="score-number">${partido.local.marcador} - ${partido.visitante.marcador}</span>
                    <span class="match-time-badge">${partido.reloj}</span>
                </div>
                ${golesInfo}
                <button class="watch-btn-modern" onclick="watchMatch('${partido.id}')">
                    VER AHORA
                </button>
            </div>
        </div>
    `;
}

// Renderizar información de goles
function renderGolesInfo(partido) {
    if (!partido.goles || partido.goles.length === 0) {
        return '';
    }

    // Agrupar goles por equipo
    const golesLocal = partido.goles.filter(g => g.equipoId === partido.local.id);
    const golesVisitante = partido.goles.filter(g => g.equipoId === partido.visitante.id);

    let html = '<div class="goles-info-modern">';

    // Mostrar solo el primer goleador de cada equipo para mantener las tarjetas compactas
    if (golesLocal.length > 0) {
        const gol = golesLocal[0];
        html += `
            <div class="gol-item-modern">
                <i class="fas fa-futbol"></i>
                <span class="gol-jugador-modern">${gol.jugador || 'Jugador'}</span>
                <span class="gol-minuto-modern">${gol.minuto}'</span>
            </div>
        `;
    }

    if (golesVisitante.length > 0) {
        const gol = golesVisitante[0];
        html += `
            <div class="gol-item-modern">
                <i class="fas fa-futbol"></i>
                <span class="gol-jugador-modern">${gol.jugador || 'Jugador'}</span>
                <span class="gol-minuto-modern">${gol.minuto}'</span>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Actualizar partidos próximos
function updateUpcomingMatches(data) {
    const container = document.getElementById('upcomingMatches');
    if (!container) return;

    const partidosProgramados = data.partidos.filter(p => p.estado?.programado && !p.estado?.enVivo);

    if (partidosProgramados.length === 0) {
        container.innerHTML = '<div class="no-matches" style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">No hay partidos próximos disponibles</div>';
        return;
    }

    container.innerHTML = partidosProgramados.map(partido => {
        const hora = formatearHora(partido.fecha);

        return `
        <div class="match-card">
            <div class="match-card-bg">
                <img src="assets/ultragol-banner.jpg" alt="ULTRAGOL">
            </div>
            <div class="match-card-content">
                <div class="match-time-badge">
                    <i class="far fa-clock"></i> ${hora}
                </div>
                <div class="teams">
                    <div class="team">
                        <img src="${partido.local.logo}" alt="${partido.local.nombreCorto}" class="team-badge" onerror="this.src='https://via.placeholder.com/50'">
                        <span>${partido.local.nombreCorto}</span>
                    </div>
                    <div class="team">
                        <img src="${partido.visitante.logo}" alt="${partido.visitante.nombreCorto}" class="team-badge" onerror="this.src='https://via.placeholder.com/50'">
                        <span>${partido.visitante.nombreCorto}</span>
                    </div>
                </div>
                <div class="match-score-mini">
                    <span class="vs-text">VS</span>
                </div>
                ${partido.detalles?.estadio ? `
                    <div class="match-venue">
                        <i class="fas fa-map-marker-alt"></i>
                        ${partido.detalles.estadio}
                    </div>
                ` : ''}
                <button class="watch-btn secondary" onclick="showToast('Este partido aún no ha comenzado')">
                    <span>PRÓXIMAMENTE</span>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Formatear hora del partido
function formatearHora(fechaStr) {
    try {
        // La fecha viene en formato "22/10/25, 7:00 p.m."
        const match = fechaStr.match(/(\d{1,2}:\d{2}\s*[ap]\.?\s*m\.?)/i);
        if (match) {
            return match[1];
        }
        return fechaStr;
    } catch (e) {
        return fechaStr;
    }
}

// Cambiar de pestaña
function switchTab(tab, element) {
    activeTab = tab;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const button = element.closest('.tab') || element;
    button.classList.add('active');
    document.getElementById(tab + 'Content').classList.add('active');

    if (tab === 'upcoming') {
        if (marcadoresData) {
            updateUpcomingMatches(marcadoresData);
        } else {
            loadMarcadores();
        }
    } else if (tab === 'replays') {
        loadReplays();
    } else if (tab === 'live') {
        if (marcadoresData) {
            updateLiveMatches(marcadoresData);
        } else {
            loadMarcadores();
        }
    }
}

// Iniciar actualización automática cada 30 segundos
function startAutoUpdate() {
    // Limpiar intervalo anterior si existe
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    // Actualizar cada 30 segundos
    updateInterval = setInterval(async () => {
        console.log('🔄 Actualizando marcadores...');
        await loadMarcadores();
    }, 30000);
}

function watchMatch(matchId, videoUrl = null, videoTitle = null) {
    const modal = document.getElementById('playerModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = document.getElementById('modalTitle');
    const loader = document.getElementById('modalLoader');

    if (videoUrl) {
        modalTitle.textContent = videoTitle || 'Video';
        modal.classList.add('active');
        loader.style.display = 'flex';

        let embedUrl = videoUrl;
        if (videoUrl.includes('youtube.com/watch')) {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0];
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        }

        modalBody.innerHTML = `
            <div class="loading-spinner" id="modalLoader" style="display: flex;">
                <div class="spinner"></div>
            </div>
            <iframe id="modalIframe" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%;"></iframe>
        `;

        const iframe = document.getElementById('modalIframe');
        iframe.onload = () => {
            setTimeout(() => {
                const loaderEl = document.getElementById('modalLoader');
                if (loaderEl) loaderEl.style.display = 'none';
            }, 500);
        };
    } else {
        let canalNumero = null;
        let partido = null;

        if (marcadoresData && marcadoresData.partidos) {
            partido = marcadoresData.partidos.find(p => p.id === matchId);

            if (partido && transmisionesData && transmisionesData.transmisiones) {
                const nombreLocal = partido.local.nombre.toLowerCase();
                const nombreVisitante = partido.visitante.nombre.toLowerCase();

                const transmision = transmisionesData.transmisiones.find(t => {
                    const evento = t.evento.toLowerCase();
                    return (evento.includes(nombreLocal) || evento.includes(nombreVisitante) ||
                            evento.includes(partido.local.nombreCorto.toLowerCase()) ||
                            evento.includes(partido.visitante.nombreCorto.toLowerCase()));
                });

                if (transmision && transmision.canales && transmision.canales.length > 0) {
                    const canalRaw = transmision.canales[0];
                    canalNumero = canalRaw.replace(/[a-z]+$/i, '');
                    console.log(`✅ Transmisión encontrada: ${transmision.evento}, Canal: ${canalNumero} (raw: ${canalRaw})`);
                }
            }
        }

        const urlParam = canalNumero || matchId;
        console.log(`🔴 Abriendo transmisión con parámetro: ${urlParam}`);

        const partidoNombre = partido ? `${partido.local.nombreCorto} vs ${partido.visitante.nombreCorto}` : matchId;

        currentStreamUrl = `ultracanales/index.html?canal=${urlParam}`;
        modalTitle.textContent = `Transmisión en Vivo - ${partidoNombre}`;
        modal.classList.add('active');
        loader.style.display = 'flex';

        modalBody.innerHTML = `
            <div class="loading-spinner" id="modalLoader" style="display: flex;">
                <div class="spinner"></div>
            </div>
            <iframe id="modalIframe" src="${currentStreamUrl}" frameborder="0" allowfullscreen style="width: 100%; height: 100%;"></iframe>
        `;

        const iframe = document.getElementById('modalIframe');
        iframe.onload = () => {
            setTimeout(() => {
                const loaderEl = document.getElementById('modalLoader');
                if (loaderEl) loaderEl.style.display = 'none';
            }, 500);
        };
    }
}

function closeModal() {
    const modal = document.getElementById('playerModal');
    const modalBody = modal.querySelector('.modal-body');

    modal.classList.remove('active');

    const iframe = document.getElementById('modalIframe');
    if (iframe) {
        iframe.src = '';
    }

    currentStreamUrl = '';

    setTimeout(() => {
        modalBody.innerHTML = `
            <div class="loading-spinner" id="modalLoader">
                <div class="spinner"></div>
            </div>
            <iframe id="modalIframe" frameborder="0" allowfullscreen></iframe>
        `;
    }, 300);
}

function refreshStream() {
    const iframe = document.getElementById('modalIframe');
    const loader = document.getElementById('modalLoader');

    loader.style.display = 'flex';
    iframe.src = currentStreamUrl;

    iframe.onload = () => {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    };
}

function fullscreenStream() {
    const iframe = document.getElementById('modalIframe');

    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
    }
}

function openStream(url) {
    currentStreamUrl = url;
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('modalIframe');
    const modalTitle = document.getElementById('modalTitle');
    const loader = document.getElementById('modalLoader');

    const streamName = url.toLowerCase().includes('ultracanales') ? 'ULTRACANALES' : 'PANEL PREMIUM';
    modalTitle.textContent = 'Transmisión en Vivo - ' + streamName;

    modal.classList.add('active');
    loader.style.display = 'flex';

    iframe.src = url;

    iframe.onload = () => {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    };
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('active');
}

function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: 'ULTRAGOL',
            text: 'Mira partidos en vivo con ULTRAGOL',
            url: window.location.href
        }).catch(() => {});
    } else {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copiado al portapapeles');
        });
    }
}

function navTo(section, element) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const button = element.closest('.nav-btn') || element;
    button.classList.add('active');

    if (section === 'search') {
        showSearchModal();
    } else if (section === 'calendar') {
        window.location.href = '../calendario.html';
    } else if (section === 'profile') {
        window.location.href = '../index.html';
    }
}

function showSearchModal() {
    showToast('Función de búsqueda próximamente');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 69, 0, 0.95);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 10000;
        animation: slideUp 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

async function loadReplays() {
    const container = document.getElementById('replayMatches');
    container.innerHTML = `<div class="loading-spinner">Cargando mejores momentos de ${currentLeague}...</div>`;

    try {
        const endpoint = leagueEndpoints[currentLeague]?.videos || '/videos';
        const response = await fetch(`https://ultragol-api3.onrender.com${endpoint}`);
        const data = await response.json();

        let allVideos = [];
        
        if (currentLeague === 'Liga MX') {
            if (data.categorias) {
                if (data.categorias.mejoresMomentos) {
                    allVideos = allVideos.concat(data.categorias.mejoresMomentos);
                }
                if (data.categorias.resumenes) {
                    allVideos = allVideos.concat(data.categorias.resumenes);
                }
                if (data.categorias.goles) {
                    allVideos = allVideos.concat(data.categorias.goles);
                }
            }
        } else {
            if (data.videos && Array.isArray(data.videos)) {
                allVideos = data.videos;
            } else if (Array.isArray(data)) {
                allVideos = data;
            }
        }

        if (allVideos && allVideos.length > 0) {
            container.innerHTML = allVideos.slice(0, 6).map((video, index) => {
                const videoUrl = video.urlEmbed || video.url || video.videoUrl || video.link || '';
                const videoTitle = video.titulo || video.title || 'Video sin título';
                const videoTitleEscaped = videoTitle.replace(/'/g, "\\'");
                const videoUrlEscaped = videoUrl.replace(/'/g, "\\'");

                return `
                <div class="match-card">
                    <div class="match-card-bg">
                        <img src="${video.thumbnail || video.imagen || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'}" alt="${videoTitle}">
                    </div>
                    <div class="match-card-content">
                        <div class="teams">
                            <h4 style="font-size: 13px; margin-bottom: 8px; color: var(--text);">${videoTitle}</h4>
                        </div>
                        <div class="match-score-mini">
                            <span class="match-time">${currentLeague}</span>
                        </div>
                        <button class="watch-btn" onclick="watchMatch('${video.id || 'video-' + index}', '${videoUrlEscaped}', '${videoTitleEscaped}')">
                            <span>VER VIDEO</span>
                        </button>
                    </div>
                </div>
                `;
            }).join('');
            console.log(`✅ Videos de ${currentLeague} cargados:`, allVideos.length);
        } else {
            container.innerHTML = `<div class="no-matches" style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">No hay videos disponibles para ${currentLeague}</div>`;
        }
    } catch (error) {
        console.error(`❌ Error cargando videos de ${currentLeague}:`, error);
        container.innerHTML = `<div class="error-message">Error al cargar los mejores momentos de ${currentLeague}</div>`;
    }
}

async function loadStandings() {
    try {
        const standingsTable = document.getElementById('standingsTable');
        if (!standingsTable) return;

        standingsTable.innerHTML = '<div class="standings-loading">Cargando tabla...</div>';

        const endpoint = leagueEndpoints[currentLeague]?.tabla || '/tabla';
        const response = await fetch(`https://ultragol-api3.onrender.com${endpoint}`);
        const data = await response.json();

        console.log('📊 Datos de tabla recibidos:', data);

        if (!data.tabla || data.tabla.length === 0) {
            standingsTable.innerHTML = `<div class="standings-loading">No hay datos de tabla disponibles para ${currentLeague}</div>`;
            return;
        }

        const equipos = data.tabla.sort((a, b) => a.posicion - b.posicion);

        standingsTable.innerHTML = `
            <div class="standings-header">
                <div class="standings-row header-row">
                    <div class="pos">#</div>
                    <div class="team-cell">Equipo</div>
                    <div class="stat">PJ</div>
                    <div class="stat">G</div>
                    <div class="stat">E</div>
                    <div class="stat">P</div>
                    <div class="stat points">PTS</div>
                </div>
            </div>
            <div class="standings-body">
                ${equipos.map((equipo, index) => {
                    const stats = equipo.estadisticas || {};
                    // Determinar zona de clasificación
                    let zoneClass = '';
                    if (index < 6) {
                        zoneClass = 'playoff-zone'; // Liguilla directa (1-6)
                    } else if (index >= 6 && index < 10) {
                        zoneClass = 'playin-zone'; // Play-In (7-10)
                    } else {
                        zoneClass = 'relegation-zone'; // Eliminados (11-18)
                    }
                    return `
                    <div class="standings-row ${zoneClass}">
                        <div class="pos">${equipo.posicion}</div>
                        <div class="team-cell">
                            <span class="team-name-standings">${equipo.equipo}</span>
                        </div>
                        <div class="stat">${stats.pj || 0}</div>
                        <div class="stat">${stats.pg || 0}</div>
                        <div class="stat">${stats.pe || 0}</div>
                        <div class="stat">${stats.pp || 0}</div>
                        <div class="stat points">${stats.pts || 0}</div>
                    </div>
                `}).join('')}
            </div>
        `;

        console.log(`✅ Tabla de ${currentLeague} cargada:`, equipos.length, 'equipos');
    } catch (error) {
        console.error(`❌ Error cargando tabla de ${currentLeague}:`, error);
        const standingsTable = document.getElementById('standingsTable');
        if (standingsTable) {
            standingsTable.innerHTML = `<div class="standings-loading">Error al cargar la tabla de ${currentLeague}</div>`;
        }
    }
}

async function loadNews() {
    try {
        const newsGrid = document.getElementById('newsGrid');
        if (!newsGrid) return;

        newsGrid.innerHTML = '<div class="news-loading">Cargando noticias...</div>';

        const endpoint = leagueEndpoints[currentLeague]?.noticias || '/noticias';
        const response = await fetch(`https://ultragol-api3.onrender.com${endpoint}`);
        const data = await response.json();

        if (!data.noticias || data.noticias.length === 0) {
            newsGrid.innerHTML = `<div class="news-loading">No hay noticias disponibles para ${currentLeague}</div>`;
            return;
        }

        newsGrid.innerHTML = data.noticias.slice(0, 6).map((noticia, index) => `
            <div class="news-card" onclick='openNewsModal(${JSON.stringify({
                titulo: noticia.titulo,
                descripcion: noticia.descripcion || noticia.contenido || '',
                imagen: noticia.imagen || noticia.urlImagen || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
                fecha: noticia.fecha || ''
            }).replace(/'/g, "\\'")})'>
                <div class="news-image">
                    <img src="${noticia.imagen || noticia.urlImagen || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'}" alt="${noticia.titulo}">
                </div>
                <div class="news-content">
                    <h4>${noticia.titulo}</h4>
                    <p>${(noticia.descripcion || noticia.contenido || '').substring(0, 100)}...</p>
                </div>
            </div>
        `).join('');

        console.log(`✅ Noticias de ${currentLeague} cargadas:`, data.noticias.length);
    } catch (error) {
        console.error(`❌ Error cargando noticias de ${currentLeague}:`, error);
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            newsGrid.innerHTML = `<div class="news-loading">Error al cargar noticias de ${currentLeague}</div>`;
        }
    }
}

function openNewsModal(noticia) {
    const modal = document.getElementById('newsModal');
    const title = document.getElementById('newsModalTitle');
    const image = document.getElementById('newsModalImage');
    const text = document.getElementById('newsModalText');

    title.textContent = noticia.titulo;
    image.src = noticia.imagen;
    text.innerHTML = `
        ${noticia.fecha ? `<p class="news-date"><i class="far fa-calendar"></i> ${noticia.fecha}</p>` : ''}
        <p>${noticia.descripcion}</p>
    `;

    modal.classList.add('active');
}

function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    modal.classList.remove('active');
}

const leagueEndpoints = {
    'Liga MX': {
        tabla: '/tabla',
        noticias: '/noticias',
        videos: '/videos',
        marcadores: '/marcadores',
        transmisiones: '/transmisiones'
    },
    'Premier League': {
        tabla: '/premier/tabla',
        noticias: '/premier/noticias',
        videos: '/premier/mejores-momentos',
        marcadores: '/premier/marcadores',
        transmisiones: '/premier/transmisiones'
    },
    'La Liga': {
        tabla: '/laliga/tabla',
        noticias: '/laliga/noticias',
        videos: '/laliga/mejores-momentos',
        marcadores: '/laliga/marcadores',
        transmisiones: '/laliga/transmisiones'
    },
    'Serie A': {
        tabla: '/seriea/tabla',
        noticias: '/seriea/noticias',
        videos: '/seriea/mejores-momentos',
        marcadores: '/seriea/marcadores',
        transmisiones: '/seriea/transmisiones'
    },
    'Bundesliga': {
        tabla: '/bundesliga/tabla',
        noticias: '/bundesliga/noticias',
        videos: '/bundesliga/mejores-momentos',
        marcadores: '/bundesliga/marcadores',
        transmisiones: '/bundesliga/transmisiones'
    },
    'Ligue 1': {
        tabla: '/ligue1/tabla',
        noticias: '/ligue1/noticias',
        videos: '/ligue1/mejores-momentos',
        marcadores: '/ligue1/marcadores',
        transmisiones: '/ligue1/transmisiones'
    }
};

async function selectLeague(leagueName, element) {
    document.querySelectorAll('.league-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    currentLeague = leagueName;

    // Actualizar título de la tabla
    const standingsTitle = document.getElementById('standingsLeagueName');
    if (standingsTitle) {
        standingsTitle.textContent = `TABLA DE POSICIONES - ${leagueName.toUpperCase()}`;
    }

    // Cargar datos de la liga seleccionada
    console.log(`🔄 Cambiando a ${leagueName}...`);
    
    // Cargar marcadores y transmisiones de la nueva liga
    await loadMarcadores();
    await loadTransmisiones();
    
    // Cargar tabla, noticias y videos
    await loadStandings();
    await loadNews();
    await loadReplays();
    
    console.log(`✅ ${leagueName} cargada completamente`);
}

function showLockedLeagueMessage(leagueName) {
    showToast(`${leagueName} estará disponible próximamente`);
}

// ===========================================
// Modal de Todas las Transmisiones
// ===========================================

async function openAllTransmissionsModal() {
    console.log('🔵 Abriendo modal de todas las transmisiones...');
    const modal = document.getElementById('allTransmissionsModal');
    const loadingDiv = modal.querySelector('.transmissions-loading');
    const gridDiv = document.getElementById('allTransmissionsGrid');
    
    // Mostrar modal
    modal.classList.add('active');
    
    // Mostrar loading
    loadingDiv.style.display = 'flex';
    gridDiv.innerHTML = '';
    
    try {
        // Obtener todas las transmisiones del endpoint
        console.log('📡 Llamando a la API: https://ultragol-api3.onrender.com/transmisiones');
        const response = await fetch('https://ultragol-api3.onrender.com/transmisiones');
        
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Data recibida:', data);
        
        // Ocultar loading
        loadingDiv.style.display = 'none';
        
        // La API devuelve un objeto con la propiedad "transmisiones"
        const transmisiones = data.transmisiones || data;
        
        if (!transmisiones || transmisiones.length === 0) {
            console.log('⚠️ No hay transmisiones disponibles');
            gridDiv.innerHTML = `
                <div class="no-transmissions">
                    <i class="fas fa-satellite-dish"></i>
                    <h4>No hay transmisiones disponibles</h4>
                    <p>Vuelve pronto para ver las próximas transmisiones</p>
                </div>
            `;
            return;
        }
        
        // Renderizar todas las transmisiones
        console.log(`🎬 Renderizando ${transmisiones.length} transmisiones...`);
        gridDiv.innerHTML = '';
        transmisiones.forEach(transmision => {
            const card = createTransmissionCard(transmision);
            gridDiv.appendChild(card);
        });
        
        console.log(`✅ Transmisiones cargadas exitosamente: ${transmisiones.length} (entre todas las ligas)`);
        
    } catch (error) {
        console.error('❌ Error al cargar transmisiones:', error);
        console.error('❌ Error detalles:', error.message, error.stack);
        loadingDiv.style.display = 'none';
        gridDiv.innerHTML = `
            <div class="no-transmissions">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error al cargar transmisiones</h4>
                <p>${error.message || 'Intenta de nuevo más tarde'}</p>
            </div>
        `;
    }
}

function createTransmissionCard(transmision) {
    const card = document.createElement('div');
    card.className = 'transmission-item';
    
    // Parsear fecha
    const fechaPartido = new Date(transmision.fecha);
    const estado = getTransmissionStatus(fechaPartido);
    
    // Obtener liga del evento
    const liga = getLeagueName(transmision.evento);
    
    // Obtener imagen del deporte
    const imagenDeporte = getSportImage(transmision.evento);
    
    // Formatear nombre del partido
    const nombrePartido = formatMatchName(transmision.evento);
    
    // Formatear hora
    const hora = fechaPartido.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const fecha = fechaPartido.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short'
    });
    
    card.innerHTML = `
        <div class="transmission-image">
            <img src="${imagenDeporte}" alt="${liga}" />
        </div>
        <div class="transmission-header">
            <span class="transmission-liga">${liga}</span>
            <span class="transmission-status ${estado.clase}">
                ${estado.pulso ? '<span class="status-dot"></span>' : ''}
                ${estado.texto}
            </span>
        </div>
        <div class="transmission-match">
            <h4>${nombrePartido}</h4>
            <div class="transmission-time">
                <i class="fas fa-clock"></i>
                ${fecha} - ${hora}
            </div>
        </div>
        <div class="transmission-channel">
            <div class="channel-info">
                <i class="fas fa-tv"></i>
                ${transmision.canales && transmision.canales.length > 0 ? 
                    (transmision.canales.length > 1 ? 
                        `${transmision.canales.length} canales disponibles` : 
                        `Canal ${transmision.canales[0].numero.replace(/[a-z]+$/i, '')}`) 
                    : 'N/A'}
            </div>
            <button class="watch-transmission-btn" data-transmission='${JSON.stringify(transmision).replace(/'/g, "&#39;")}'>
                <i class="fas fa-play"></i>
                Ver ${transmision.canales && transmision.canales.length > 1 ? 'Opciones' : ''}
            </button>
        </div>
    `;
    
    return card;
}

function getTransmissionStatus(fechaPartido) {
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

function getLeagueName(evento) {
    const ligaMatch = evento.match(/^([^:]+):/);
    return ligaMatch ? ligaMatch[1].trim() : 'Fútbol';
}

function formatMatchName(evento) {
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

function getSportImage(evento) {
    const eventoLower = evento.toLowerCase();
    
    // Detectar motos
    if (eventoLower.includes('moto') || eventoLower.includes('motogp') || 
        eventoLower.includes('superbike') || eventoLower.includes('motorcycle')) {
        return '../assets/motos-banner.jpg';
    }
    
    // Detectar básquetbol
    if (eventoLower.includes('basket') || eventoLower.includes('nba') || 
        eventoLower.includes('básquet') || eventoLower.includes('baloncesto')) {
        return '../assets/basquet-banner.jpg';
    }
    
    // Por defecto, fútbol
    return '../assets/futbol-banner.jpg';
}

// Variable global para almacenar la transmisión actual
let currentTransmission = null;

function watchTransmission(transmisionData) {
    // Si es un string (llamada antigua), convertir a objeto simple
    if (typeof transmisionData === 'string') {
        currentTransmission = {
            evento: 'Transmisión',
            canales: [{
                numero: transmisionData,
                nombre: `Canal ${transmisionData}`,
                links: {
                    hoca: `https://bolaloca.my/player/2/${transmisionData}`,
                    caster: `https://bolaloca.my/player/3/${transmisionData}`,
                    wigi: `https://bolaloca.my/player/4/${transmisionData}`
                }
            }]
        };
    } else {
        currentTransmission = transmisionData;
    }
    
    // Abrir el modal de opciones
    openStreamOptionsModal();
}

function openStreamOptionsModal() {
    if (!currentTransmission) return;
    
    const modal = document.getElementById('streamOptionsModal');
    const matchName = document.getElementById('streamMatchName');
    const optionsGrid = document.getElementById('streamOptionsGrid');
    
    // Formatear el nombre del partido
    const nombrePartido = formatMatchName(currentTransmission.evento);
    matchName.textContent = nombrePartido;
    
    // Limpiar grid
    optionsGrid.innerHTML = '';
    
    // Crear opciones para cada canal
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
    
    // Mostrar modal
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

function selectStreamOption(streamUrl) {
    // Cerrar el modal de opciones
    closeStreamOptionsModal();
    
    // Cerrar el modal de transmisiones si está abierto
    closeAllTransmissionsModal();
    
    // Abrir la transmisión en una nueva pestaña
    window.open(streamUrl, '_blank');
}

function closeStreamOptionsModal() {
    const modal = document.getElementById('streamOptionsModal');
    modal.classList.remove('active');
    currentTransmission = null;
}

function closeAllTransmissionsModal() {
    const modal = document.getElementById('allTransmissionsModal');
    modal.classList.remove('active');
}

// Cerrar modal al hacer clic fuera
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('allTransmissionsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllTransmissionsModal();
            }
        });
    }
    
    // Cerrar modal de opciones al hacer clic en overlay
    const streamOptionsModal = document.getElementById('streamOptionsModal');
    if (streamOptionsModal) {
        streamOptionsModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('stream-options-overlay')) {
                closeStreamOptionsModal();
            }
        });
    }
});

// Delegar eventos de clic para los botones de transmisión
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.watch-transmission-btn');
    if (btn && btn.dataset.transmission) {
        try {
            const transmisionData = JSON.parse(btn.dataset.transmission.replace(/&#39;/g, "'"));
            watchTransmission(transmisionData);
        } catch (error) {
            console.error('Error al parsear datos de transmisión:', error);
        }
    }
});
