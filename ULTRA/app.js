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

function loadUpcomingMatches() {
    const container = document.getElementById('upcomingMatches');
    container.innerHTML = `
        <div class="match-card">
            <div class="match-card-bg">
                <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600" alt="Match">
            </div>
            <div class="match-card-content">
                <div class="teams">
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg" alt="Barcelona" class="team-badge">
                        <span>BARCELONA</span>
                    </div>
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg" alt="Real Madrid" class="team-badge">
                        <span>R. MADRID</span>
                    </div>
                </div>
                <div class="match-score-mini">
                    <span class="match-time">18:00</span>
                </div>
                <button class="watch-btn" onclick="showToast('Este partido aún no ha comenzado')">
                    <span>PRÓXIMAMENTE</span>
                </button>
            </div>
        </div>
        <div class="match-card">
            <div class="match-card-bg">
                <img src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=600" alt="Match">
            </div>
            <div class="match-card-content">
                <div class="teams">
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/en/8/84/Juventus_FC_-_pictogram.svg" alt="Juventus" class="team-badge">
                        <span>JUVENTUS</span>
                    </div>
                    <div class="team">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/SSC_Napoli_2024.svg" alt="Napoli" class="team-badge">
                        <span>NAPOLI</span>
                    </div>
                </div>
                <div class="match-score-mini">
                    <span class="match-time">20:45</span>
                </div>
                <button class="watch-btn" onclick="showToast('Este partido aún no ha comenzado')">
                    <span>PRÓXIMAMENTE</span>
                </button>
            </div>
        </div>
    `;
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

document.addEventListener('DOMContentLoaded', () => {
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
    `;
    document.head.appendChild(style);
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = true;
    }
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
