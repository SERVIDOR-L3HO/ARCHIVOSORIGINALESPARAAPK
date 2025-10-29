// ================================================
// GOLEADORES - INTEGRACIÓN CON API REAL
// ================================================

const API_BASE = 'https://ultragol-api3.onrender.com';
let currentLeague = 'ligamx';
let currentEndpoint = '/goleadores';
let allScorers = [];
let filteredScorers = [];

// ================================================
// INICIALIZACIÓN
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadScorers();
});

function initializeApp() {
    console.log('🎯 Módulo de Goleadores (Dark Theme) inicializado');
}

// ================================================
// EVENT LISTENERS
// ================================================

function setupEventListeners() {
    const leagueBtns = document.querySelectorAll('.league-btn');
    leagueBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const league = btn.dataset.league;
            const endpoint = btn.dataset.endpoint;
            switchLeague(league, endpoint, btn);
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterScorers(e.target.value);
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// ================================================
// CAMBIAR LIGA
// ================================================

function switchLeague(league, endpoint, btnElement) {
    currentLeague = league;
    currentEndpoint = endpoint;

    document.querySelectorAll('.league-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    btnElement.classList.add('active');

    loadScorers();
}

// ================================================
// CARGAR GOLEADORES
// ================================================

async function loadScorers() {
    showLoading(true);
    console.log('📡 Cargando goleadores desde:', `${API_BASE}${currentEndpoint}`);
    
    try {
        const response = await fetch(`${API_BASE}${currentEndpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        if (data && data.goleadores) {
            allScorers = data.goleadores;
            filteredScorers = [...allScorers];
            console.log(`✅ ${allScorers.length} goleadores cargados`);
            
            updateStats(data);
            renderPodium();
            renderScorersList();
        } else {
            console.warn('⚠️ No se encontraron goleadores en la respuesta');
            showEmptyState();
        }
        
    } catch (error) {
        console.error('❌ Error al cargar goleadores:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

// ================================================
// ACTUALIZAR ESTADÍSTICAS
// ================================================

function updateStats(data) {
    const totalGoalsEl = document.getElementById('totalGoals');
    const totalPlayersEl = document.getElementById('totalPlayers');
    const lastUpdateEl = document.getElementById('lastUpdate');
    
    if (totalGoalsEl) {
        const totalGoals = allScorers.reduce((sum, player) => sum + player.goles, 0);
        animateNumber(totalGoalsEl, 0, totalGoals, 1000);
    }
    
    if (totalPlayersEl) {
        animateNumber(totalPlayersEl, 0, data.total || allScorers.length, 1000);
    }
    
    if (lastUpdateEl && data.actualizado) {
        const dateStr = data.actualizado.split(',')[0];
        lastUpdateEl.textContent = dateStr;
    }
}

function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// ================================================
// RENDER PODIUM
// ================================================

function renderPodium() {
    const podiumContainer = document.getElementById('podiumContainer');
    const top3 = filteredScorers.slice(0, 3);
    
    if (top3.length === 0) {
        podiumContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h3>No hay datos disponibles</h3>
                <p>No se encontraron goleadores para esta liga</p>
            </div>
        `;
        return;
    }
    
    podiumContainer.innerHTML = top3.map((player, index) => {
        const rank = index + 1;
        
        return `
            <div class="podium-item rank-${rank}">
                <div class="podium-card">
                    <div class="podium-rank-badge">${rank}</div>
                    <h3 class="podium-player-name">${player.jugador}</h3>
                    <p class="podium-team">${player.equipo}</p>
                    <div class="podium-goals">${player.goles}</div>
                    <div class="podium-label">Goles</div>
                </div>
                <div class="podium-base">${rank}</div>
            </div>
        `;
    }).join('');
}

// ================================================
// RENDER LISTA DE GOLEADORES
// ================================================

function renderScorersList() {
    const scorersList = document.getElementById('scorersList');
    
    if (filteredScorers.length === 0) {
        scorersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otra búsqueda</p>
            </div>
        `;
        return;
    }
    
    scorersList.innerHTML = filteredScorers.map((player, index) => {
        return `
            <div class="scorer-item" style="animation-delay: ${index * 0.03}s">
                <div class="scorer-position">${player.posicion || (index + 1)}</div>
                <div class="scorer-info">
                    <div class="scorer-name">${player.jugador}</div>
                    <div class="scorer-team">${player.equipo}</div>
                </div>
                <div class="scorer-goals">
                    <div class="goals-number">${player.goles}</div>
                    <div class="goals-label">Goles</div>
                </div>
            </div>
        `;
    }).join('');
}

// ================================================
// FILTRAR GOLEADORES
// ================================================

function filterScorers(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredScorers = [...allScorers];
    } else {
        filteredScorers = allScorers.filter(player => {
            const playerName = player.jugador.toLowerCase();
            const teamName = player.equipo.toLowerCase();
            return playerName.includes(term) || teamName.includes(term);
        });
    }
    
    renderPodium();
    renderScorersList();
}

// ================================================
// ESTADOS DE CARGA Y ERROR
// ================================================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

function showEmptyState() {
    const podiumContainer = document.getElementById('podiumContainer');
    const scorersList = document.getElementById('scorersList');
    
    const emptyHTML = `
        <div class="empty-state">
            <i class="fas fa-futbol"></i>
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron goleadores para esta liga</p>
        </div>
    `;
    
    if (podiumContainer) podiumContainer.innerHTML = emptyHTML;
    if (scorersList) scorersList.innerHTML = emptyHTML;
}

function showError() {
    const podiumContainer = document.getElementById('podiumContainer');
    const scorersList = document.getElementById('scorersList');
    
    const errorHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar datos</h3>
            <p>No se pudieron obtener los datos. Por favor, intenta más tarde.</p>
        </div>
    `;
    
    if (podiumContainer) podiumContainer.innerHTML = errorHTML;
    if (scorersList) scorersList.innerHTML = errorHTML;
}

console.log('🎯 Sistema de goleadores con API real cargado correctamente');
