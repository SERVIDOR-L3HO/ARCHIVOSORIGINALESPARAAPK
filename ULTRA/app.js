let currentStreamUrl = '';
let activeTab = 'live';

function switchTab(tab, element) {
    activeTab = tab;
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const button = element.closest('.tab') || element;
    button.classList.add('active');
    document.getElementById(tab + 'Content').classList.add('active');
    
    if (tab === 'upcoming') {
        loadUpcomingMatches();
    } else if (tab === 'replays') {
        loadReplays();
    }
}

function watchMatch(matchId) {
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('modalIframe');
    const modalTitle = document.getElementById('modalTitle');
    const loader = document.getElementById('modalLoader');
    
    currentStreamUrl = 'https://servidor-l3ho.github.io/ULTRACANALES.2/index.html';
    
    modalTitle.textContent = 'Transmisión en Vivo - ' + matchId.toUpperCase();
    modal.classList.add('active');
    loader.style.display = 'flex';
    
    iframe.src = currentStreamUrl;
    
    iframe.onload = () => {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    };
}

function closeModal() {
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('modalIframe');
    
    modal.classList.remove('active');
    iframe.src = '';
    currentStreamUrl = '';
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
    
    const streamName = url.includes('ULTRACANALES') ? 'ULTRACANALES' : 'PANEL PREMIUM';
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

async function loadUpcomingMatches() {
    const container = document.getElementById('upcomingMatches');
    container.innerHTML = '<div class="loading-spinner">Cargando partidos...</div>';
    
    try {
        const partidos = await ULTRAGOL_API.getPartidosProximos();
        
        if (partidos.length === 0) {
            container.innerHTML = '<div class="no-matches">No hay partidos próximos disponibles</div>';
            return;
        }
        
        container.innerHTML = partidos.slice(0, 6).map(partido => `
            <div class="match-card">
                <div class="match-card-bg">
                    <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600" alt="Match">
                </div>
                <div class="match-card-content">
                    <div class="teams">
                        <div class="team">
                            <img src="${ULTRAGOL_API.getTeamLogo(partido.equipoLocal)}" alt="${partido.equipoLocal}" class="team-badge" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${partido.equipoLocal || 'TBD'}</span>
                        </div>
                        <div class="team">
                            <img src="${ULTRAGOL_API.getTeamLogo(partido.equipoVisitante)}" alt="${partido.equipoVisitante}" class="team-badge" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${partido.equipoVisitante || 'TBD'}</span>
                        </div>
                    </div>
                    <div class="match-score-mini">
                        <span class="match-time">${partido.hora || 'TBD'}</span>
                    </div>
                    <button class="watch-btn" onclick="showToast('Este partido aún no ha comenzado')">
                        <span>PRÓXIMAMENTE</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading upcoming matches:', error);
        container.innerHTML = '<div class="error-message">Error al cargar partidos próximos</div>';
    }
}

function loadReplays() {
    const container = document.getElementById('replayMatches');
    container.innerHTML = `
        <div class="match-card">
            <div class="match-card-bg">
                <img src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600" alt="Match">
            </div>
            <div class="match-card-content">
                <div class="teams">
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/en/c/c5/Paris_Saint-Germain_F.C._logo.svg" alt="PSG" class="team-badge">
                        <span>PSG</span>
                    </div>
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/en/4/44/Olympique_Lyonnais.svg" alt="Lyon" class="team-badge">
                        <span>LYON</span>
                    </div>
                </div>
                <div class="match-score-mini">
                    2 - 1
                    <span class="match-time">FT</span>
                </div>
                <button class="watch-btn" onclick="watchMatch('psg-lyon-replay')">
                    <span>VER REPETICIÓN</span>
                </button>
            </div>
        </div>
        <div class="match-card">
            <div class="match-card-bg">
                <img src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600" alt="Match">
            </div>
            <div class="match-card-content">
                <div class="teams">
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9a/Borussia_Dortmund_logo.svg" alt="Dortmund" class="team-badge">
                        <span>DORTMUND</span>
                    </div>
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg" alt="Bayern" class="team-badge">
                        <span>BAYERN</span>
                    </div>
                </div>
                <div class="match-score-mini">
                    1 - 3
                    <span class="match-time">FT</span>
                </div>
                <button class="watch-btn" onclick="watchMatch('dortmund-bayern-replay')">
                    <span>VER REPETICIÓN</span>
                </button>
            </div>
        </div>
    `;
}

async function loadLiveMatches() {
    const container = document.getElementById('liveMatches');
    if (!container) return;
    
    try {
        const partidos = await ULTRAGOL_API.getPartidosEnVivo();
        
        if (partidos.length === 0) {
            container.innerHTML = '<div class="no-matches">No hay partidos en vivo en este momento</div>';
            return;
        }
        
        container.innerHTML = partidos.map(partido => `
            <div class="match-card">
                <div class="match-card-bg">
                    <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600" alt="Match">
                </div>
                <div class="match-card-content">
                    <div class="teams">
                        <div class="team">
                            <img src="${ULTRAGOL_API.getTeamLogo(partido.equipoLocal)}" alt="${partido.equipoLocal}" class="team-badge" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${partido.equipoLocal || 'TBD'}</span>
                        </div>
                        <div class="team">
                            <img src="${ULTRAGOL_API.getTeamLogo(partido.equipoVisitante)}" alt="${partido.equipoVisitante}" class="team-badge" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${partido.equipoVisitante || 'TBD'}</span>
                        </div>
                    </div>
                    <div class="match-score-mini">
                        ${partido.marcador || '0 - 0'}
                        <span class="match-time live-indicator">LIVE</span>
                    </div>
                    <button class="watch-btn" onclick="watchMatch('${partido.id || 'live-match'}')">
                        <span>WATCH NOW</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading live matches:', error);
    }
}

async function loadLeagues() {
    try {
        const ligas = await ULTRAGOL_API.getLigas();
        console.log('Ligas disponibles:', ligas);
        
        const leagueBtns = document.querySelectorAll('.league-btn');
        leagueBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                leagueBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const leagueName = this.querySelector('span').textContent;
                await loadMatchesByLeague(leagueName);
            });
        });
    } catch (error) {
        console.error('Error loading leagues:', error);
    }
}

async function loadMatchesByLeague(leagueName) {
    showToast(`Cargando datos de ${leagueName}...`);
    console.log(`Loading data for ${leagueName}`);
    
    try {
        const [tabla, goleadores, noticias] = await Promise.all([
            ULTRAGOL_API.getTablaPorLiga(leagueName),
            ULTRAGOL_API.getGoleadoresPorLiga(leagueName),
            ULTRAGOL_API.getNoticiasPorLiga(leagueName)
        ]);
        
        console.log(`Datos de ${leagueName}:`, { tabla, goleadores, noticias });
        
        if (noticias.length > 0) {
            const newsGrid = document.querySelector('.news-grid');
            if (newsGrid) {
                newsGrid.innerHTML = noticias.slice(0, 6).map(noticia => `
                    <div class="news-card">
                        <img src="${noticia.imagen || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600'}" alt="${noticia.titulo}" onerror="this.src='https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600'">
                        <div class="news-content">
                            <h4>${noticia.titulo || noticia.headline || 'Noticia sin título'}</h4>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error(`Error loading data for ${leagueName}:`, error);
    }
}

async function loadNews() {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;
    
    try {
        const noticias = await ULTRAGOL_API.getAllNoticias();
        
        if (noticias.length === 0) {
            console.log('No hay noticias disponibles');
            return;
        }
        
        newsGrid.innerHTML = noticias.slice(0, 6).map(noticia => `
            <div class="news-card">
                <img src="${noticia.imagen || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600'}" alt="${noticia.titulo}" onerror="this.src='https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600'">
                <div class="news-content">
                    <h4>${noticia.titulo || noticia.headline || 'Noticia sin título'}</h4>
                    ${noticia.liga ? `<span class="news-league">${noticia.liga}</span>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideDown {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
        .loading-spinner {
            text-align: center;
            padding: 40px;
            color: #fff;
        }
        .no-matches, .error-message {
            text-align: center;
            padding: 40px;
            color: rgba(255,255,255,0.7);
        }
        .live-indicator {
            background: #ff4500;
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 8px;
        }
    `;
    document.head.appendChild(style);
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = true;
    }
    
    await loadLeagues();
    await loadLiveMatches();
    await loadNews();
});

document.addEventListener('click', (e) => {
    if (e.target.id === 'playerModal') {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel.classList.contains('active')) {
            toggleSettings();
        }
    }
});
