let isFloatingPlayerActive = false;
let floatingPlayerUrl = '';
let floatingPlayerTitle = '';
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

function togglePictureInPicture() {
    const playerModal = document.getElementById('playerModal');
    const floatingPlayer = document.getElementById('floatingPlayer');
    const modalIframe = document.getElementById('modalIframe');
    const floatingIframe = document.getElementById('floatingIframe');
    
    if (!modalIframe || !modalIframe.src || modalIframe.src === 'about:blank') {
        if (typeof showToast === 'function') {
            showToast('No hay transmisión activa para minimizar');
        }
        return;
    }
    
    floatingPlayerUrl = modalIframe.src;
    floatingPlayerTitle = document.getElementById('modalTitle')?.textContent || 'Transmisión en Vivo';
    
    if (floatingIframe) {
        floatingIframe.src = floatingPlayerUrl;
    }
    
    const matchTitleEl = floatingPlayer?.querySelector('.floating-match-title');
    if (matchTitleEl) {
        matchTitleEl.textContent = floatingPlayerTitle;
    }
    
    if (playerModal) {
        playerModal.classList.remove('active');
    }
    document.body.style.overflow = '';
    
    if (floatingPlayer) {
        floatingPlayer.style.display = 'block';
    }
    isFloatingPlayerActive = true;
    
    if (floatingPlayer) {
        initDraggable(floatingPlayer);
    }
    
    if (typeof showToast === 'function') {
        showToast('Modo ventana flotante activado');
    }
    console.log('📺 PiP activado:', floatingPlayerTitle);
}

function expandFloatingPlayer() {
    const floatingPlayer = document.getElementById('floatingPlayer');
    const playerModal = document.getElementById('playerModal');
    const modalIframe = document.getElementById('modalIframe');
    const floatingIframe = document.getElementById('floatingIframe');
    
    if (floatingIframe.src && floatingIframe.src !== 'about:blank') {
        modalIframe.src = floatingIframe.src;
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = floatingPlayerTitle || 'Transmisión en Vivo';
        }
    }
    
    floatingPlayer.style.display = 'none';
    floatingIframe.src = '';
    isFloatingPlayerActive = false;
    
    playerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (typeof modalNavigation !== 'undefined' && modalNavigation) {
        modalNavigation.resetHistory();
        modalNavigation.pushModal('playerModal', { streamUrl: modalIframe.src, title: floatingPlayerTitle });
    }
    
    if (typeof currentStreamUrl !== 'undefined') {
        currentStreamUrl = modalIframe.src;
    }
    if (typeof currentStreamTitle !== 'undefined') {
        currentStreamTitle = floatingPlayerTitle;
    }
    
    if (typeof showToast === 'function') {
        showToast('Transmisión expandida');
    }
    console.log('📺 Ventana flotante expandida');
}

function closeFloatingPlayer() {
    const floatingPlayer = document.getElementById('floatingPlayer');
    const floatingIframe = document.getElementById('floatingIframe');
    
    floatingPlayer.style.display = 'none';
    floatingIframe.src = '';
    isFloatingPlayerActive = false;
    floatingPlayerUrl = '';
    floatingPlayerTitle = '';
    
    console.log('📺 Ventana flotante cerrada');
}

function initDraggable(element) {
    const header = element.querySelector('.floating-player-header');
    if (!header) return;
    
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDragTouch, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', dragTouch, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

function startDrag(e) {
    const floatingPlayer = document.getElementById('floatingPlayer');
    isDragging = true;
    dragOffsetX = e.clientX - floatingPlayer.offsetLeft;
    dragOffsetY = e.clientY - floatingPlayer.offsetTop;
    floatingPlayer.style.transition = 'none';
}

function startDragTouch(e) {
    const floatingPlayer = document.getElementById('floatingPlayer');
    isDragging = true;
    const touch = e.touches[0];
    dragOffsetX = touch.clientX - floatingPlayer.offsetLeft;
    dragOffsetY = touch.clientY - floatingPlayer.offsetTop;
    floatingPlayer.style.transition = 'none';
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const floatingPlayer = document.getElementById('floatingPlayer');
    let newX = e.clientX - dragOffsetX;
    let newY = e.clientY - dragOffsetY;
    
    newX = Math.max(0, Math.min(newX, window.innerWidth - floatingPlayer.offsetWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - floatingPlayer.offsetHeight));
    
    floatingPlayer.style.left = newX + 'px';
    floatingPlayer.style.right = 'auto';
    floatingPlayer.style.top = newY + 'px';
    floatingPlayer.style.bottom = 'auto';
}

function dragTouch(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const floatingPlayer = document.getElementById('floatingPlayer');
    let newX = touch.clientX - dragOffsetX;
    let newY = touch.clientY - dragOffsetY;
    
    newX = Math.max(0, Math.min(newX, window.innerWidth - floatingPlayer.offsetWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - floatingPlayer.offsetHeight));
    
    floatingPlayer.style.left = newX + 'px';
    floatingPlayer.style.right = 'auto';
    floatingPlayer.style.top = newY + 'px';
    floatingPlayer.style.bottom = 'auto';
}

function stopDrag() {
    if (isDragging) {
        isDragging = false;
        const floatingPlayer = document.getElementById('floatingPlayer');
        floatingPlayer.style.transition = '';
    }
}

let isWidgetOpen = false;

function toggleMatchesWidget() {
    const widgetExpanded = document.getElementById('matchesWidgetExpanded');
    
    if (isWidgetOpen) {
        closeMatchesWidget();
    } else {
        widgetExpanded.classList.add('active');
        isWidgetOpen = true;
        updateWidgetMatches();
    }
}

function closeMatchesWidget() {
    const widgetExpanded = document.getElementById('matchesWidgetExpanded');
    widgetExpanded.classList.remove('active');
    isWidgetOpen = false;
}

function updateWidgetMatches() {
    const matchesList = document.getElementById('widgetMatchesList');
    const matchCountBadge = document.getElementById('widgetMatchCount');
    
    if (!matchesList || !matchCountBadge) return;
    
    const transmisiones = (typeof transmisionesData !== 'undefined' && transmisionesData?.transmisiones) 
        ? transmisionesData.transmisiones 
        : [];
    
    if (transmisiones.length === 0) {
        matchesList.innerHTML = `
            <div class="widget-no-matches">
                <i class="fas fa-futbol"></i>
                <p>No hay partidos disponibles</p>
            </div>
        `;
        matchCountBadge.textContent = '0';
        return;
    }
    
    const partidos = transmisiones.slice(0, 10);
    matchCountBadge.textContent = Math.min(partidos.length, 99);
    
    if (partidos.length === 0) {
        matchesList.innerHTML = `
            <div class="widget-no-matches">
                <i class="fas fa-futbol"></i>
                <p>No hay partidos en este momento</p>
            </div>
        `;
        return;
    }
    
    matchesList.innerHTML = partidos.map((partido, index) => {
        const isLive = partido.estado === 'EN VIVO' || partido.estado === 'LIVE' || partido.enVivo;
        const hora = partido.hora || partido.time || '';
        const local = partido.local || partido.homeTeam || partido.equipo1 || 'Equipo 1';
        const visitante = partido.visitante || partido.awayTeam || partido.equipo2 || 'Equipo 2';
        const localLogo = partido.localLogo || partido.homeLogo || 'https://via.placeholder.com/24';
        const visitanteLogo = partido.visitanteLogo || partido.awayLogo || 'https://via.placeholder.com/24';
        const marcador = partido.marcador || partido.score || `${partido.golesLocal || 0} - ${partido.golesVisitante || 0}`;
        
        return `
            <div class="widget-match-item" onclick="playFromWidget(${index})">
                <div class="widget-match-teams">
                    <div class="widget-team">
                        <img src="${localLogo}" alt="${local}" class="widget-team-logo" onerror="this.src='https://via.placeholder.com/24'">
                        <span class="widget-team-name">${local}</span>
                    </div>
                    <div class="widget-team">
                        <img src="${visitanteLogo}" alt="${visitante}" class="widget-team-logo" onerror="this.src='https://via.placeholder.com/24'">
                        <span class="widget-team-name">${visitante}</span>
                    </div>
                </div>
                <div class="widget-match-score">
                    <span class="widget-score-text">${marcador}</span>
                    ${isLive ? 
                        `<span class="widget-live-indicator"><span class="live-dot"></span>LIVE</span>` : 
                        `<span class="widget-time-indicator">${hora}</span>`
                    }
                </div>
                <button class="widget-play-btn" onclick="event.stopPropagation(); playFromWidget(${index})">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `;
    }).join('');
}

function playFromWidget(index) {
    const transmisiones = (typeof transmisionesData !== 'undefined' && transmisionesData?.transmisiones) 
        ? transmisionesData.transmisiones 
        : [];
    
    if (!transmisiones[index]) {
        if (typeof showToast === 'function') {
            showToast('Partido no disponible');
        }
        return;
    }
    
    const partido = transmisiones[index];
    
    closeMatchesWidget();
    
    const local = partido.local || partido.homeTeam || partido.equipo1 || 'Local';
    const visitante = partido.visitante || partido.awayTeam || partido.equipo2 || 'Visitante';
    const titulo = `${local} vs ${visitante}`;
    
    if (partido.canales && partido.canales.length > 0 && typeof openChannelSelector === 'function') {
        openChannelSelector(partido, titulo);
    } else if (partido.url || partido.streamUrl || partido.link) {
        const streamUrl = partido.url || partido.streamUrl || partido.link;
        openStreamModalLocal(streamUrl, titulo);
    } else if (typeof watchMatch === 'function') {
        const matchId = partido.id || partido.matchId || `match-${index}`;
        watchMatch(matchId);
    }
    
    console.log('📺 Reproduciendo desde widget:', titulo);
}

function openStreamModalLocal(url, title) {
    const playerModal = document.getElementById('playerModal');
    const modalIframe = document.getElementById('modalIframe');
    const modalTitleEl = document.getElementById('modalTitle');
    
    if (modalIframe) {
        modalIframe.src = url;
    }
    if (modalTitleEl) {
        modalTitleEl.textContent = title || 'Transmisión en Vivo';
    }
    
    if (playerModal) {
        playerModal.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
    
    if (typeof currentStreamUrl !== 'undefined') {
        window.currentStreamUrl = url;
    }
    if (typeof currentStreamTitle !== 'undefined') {
        window.currentStreamTitle = title;
    }
    
    if (typeof modalNavigation !== 'undefined' && modalNavigation) {
        modalNavigation.resetHistory();
        modalNavigation.pushModal('playerModal', { streamUrl: url, title: title });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Sistema de ventana flotante y widget inicializado');
    
    setTimeout(() => {
        updateWidgetMatches();
    }, 3000);
    
    setInterval(() => {
        if (isWidgetOpen) {
            updateWidgetMatches();
        }
    }, 30000);
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && isFloatingPlayerActive) {
        console.log('📺 App en segundo plano - Ventana flotante activa');
    }
});

window.togglePictureInPicture = togglePictureInPicture;
window.expandFloatingPlayer = expandFloatingPlayer;
window.closeFloatingPlayer = closeFloatingPlayer;
window.toggleMatchesWidget = toggleMatchesWidget;
window.closeMatchesWidget = closeMatchesWidget;
window.playFromWidget = playFromWidget;
