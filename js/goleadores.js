// ================================================
// GOLEADORES - FUNCIONALIDAD PROFESIONAL
// ================================================

const scorersData = [
    {
        id: 1,
        name: "André-Pierre Gignac",
        team: "Tigres UANL",
        teamLogo: "🐯",
        position: "Delantero",
        nationality: "Francia",
        image: "https://via.placeholder.com/150/667eea/ffffff?text=APG",
        goals: 18,
        assists: 7,
        matches: 15,
        penalties: 4,
        minutesPlayed: 1350,
        competition: "ligamx"
    },
    {
        id: 2,
        name: "Germán Berterame",
        team: "Monterrey",
        teamLogo: "⚔️",
        position: "Delantero",
        nationality: "Argentina",
        image: "https://via.placeholder.com/150/764ba2/ffffff?text=GB",
        goals: 16,
        assists: 5,
        matches: 15,
        penalties: 2,
        minutesPlayed: 1320,
        competition: "ligamx"
    },
    {
        id: 3,
        name: "Henry Martín",
        team: "América",
        teamLogo: "🦅",
        position: "Delantero",
        nationality: "México",
        image: "https://via.placeholder.com/150/f093fb/ffffff?text=HM",
        goals: 15,
        assists: 6,
        matches: 14,
        penalties: 3,
        minutesPlayed: 1260,
        competition: "ligamx"
    },
    {
        id: 4,
        name: "Rogelio Funes Mori",
        team: "Monterrey",
        teamLogo: "⚔️",
        position: "Delantero",
        nationality: "México",
        image: "https://via.placeholder.com/150/4facfe/ffffff?text=RFM",
        goals: 14,
        assists: 4,
        matches: 15,
        penalties: 5,
        minutesPlayed: 1380,
        competition: "ligamx"
    },
    {
        id: 5,
        name: "Julián Quiñones",
        team: "América",
        teamLogo: "🦅",
        position: "Delantero",
        nationality: "Colombia",
        image: "https://via.placeholder.com/150/00f2fe/ffffff?text=JQ",
        goals: 13,
        assists: 8,
        matches: 14,
        penalties: 1,
        minutesPlayed: 1200,
        competition: "ligamx"
    },
    {
        id: 6,
        name: "Víctor Guzmán",
        team: "Guadalajara",
        teamLogo: "🐐",
        position: "Mediocampista",
        nationality: "México",
        image: "https://via.placeholder.com/150/43e97b/ffffff?text=VG",
        goals: 12,
        assists: 9,
        matches: 15,
        penalties: 0,
        minutesPlayed: 1350,
        competition: "ligamx"
    },
    {
        id: 7,
        name: "Alexis Vega",
        team: "Guadalajara",
        teamLogo: "🐐",
        position: "Delantero",
        nationality: "México",
        image: "https://via.placeholder.com/150/f9ca24/ffffff?text=AV",
        goals: 11,
        assists: 7,
        matches: 14,
        penalties: 2,
        minutesPlayed: 1260,
        competition: "ligamx"
    },
    {
        id: 8,
        name: "Nicolás Ibáñez",
        team: "Pachuca",
        teamLogo: "⚪",
        position: "Delantero",
        nationality: "Argentina",
        image: "https://via.placeholder.com/150/6c5ce7/ffffff?text=NI",
        goals: 11,
        assists: 3,
        matches: 15,
        penalties: 3,
        minutesPlayed: 1350,
        competition: "ligamx"
    },
    {
        id: 9,
        name: "Erick Sánchez",
        team: "Pachuca",
        teamLogo: "⚪",
        position: "Mediocampista",
        nationality: "México",
        image: "https://via.placeholder.com/150/fd79a8/ffffff?text=ES",
        goals: 10,
        assists: 6,
        matches: 15,
        penalties: 0,
        minutesPlayed: 1320,
        competition: "ligamx"
    },
    {
        id: 10,
        name: "Orbelín Pineda",
        team: "AEK Atenas",
        teamLogo: "🇬🇷",
        position: "Mediocampista",
        nationality: "México",
        image: "https://via.placeholder.com/150/a29bfe/ffffff?text=OP",
        goals: 9,
        assists: 5,
        matches: 13,
        penalties: 1,
        minutesPlayed: 1170,
        competition: "ligamx"
    },
    {
        id: 11,
        name: "Lucas Di Yorio",
        team: "León",
        teamLogo: "🦁",
        position: "Delantero",
        nationality: "Argentina",
        image: "https://via.placeholder.com/150/74b9ff/ffffff?text=LD",
        goals: 9,
        assists: 4,
        matches: 14,
        penalties: 2,
        minutesPlayed: 1260,
        competition: "ligamx"
    },
    {
        id: 12,
        name: "Roberto Alvarado",
        team: "Guadalajara",
        teamLogo: "🐐",
        position: "Mediocampista",
        nationality: "México",
        image: "https://via.placeholder.com/150/fab1a0/ffffff?text=RA",
        goals: 8,
        assists: 10,
        matches: 15,
        penalties: 0,
        minutesPlayed: 1350,
        competition: "ligamx"
    },
    {
        id: 13,
        name: "Jesús Corona",
        team: "Cruz Azul",
        teamLogo: "🔵",
        position: "Delantero",
        nationality: "México",
        image: "https://via.placeholder.com/150/55efc4/ffffff?text=JC",
        goals: 8,
        assists: 5,
        matches: 14,
        penalties: 1,
        minutesPlayed: 1200,
        competition: "ligamx"
    },
    {
        id: 14,
        name: "Brian Rodríguez",
        team: "América",
        teamLogo: "🦅",
        position: "Extremo",
        nationality: "Uruguay",
        image: "https://via.placeholder.com/150/ff7675/ffffff?text=BR",
        goals: 7,
        assists: 6,
        matches: 13,
        penalties: 0,
        minutesPlayed: 1080,
        competition: "ligamx"
    },
    {
        id: 15,
        name: "Paulinho",
        team: "Toluca",
        teamLogo: "🔴",
        position: "Delantero",
        nationality: "Brasil",
        image: "https://via.placeholder.com/150/fdcb6e/ffffff?text=P",
        goals: 7,
        assists: 4,
        matches: 14,
        penalties: 2,
        minutesPlayed: 1260,
        competition: "ligamx"
    }
];

// Estado global
let filteredData = [...scorersData];
let currentView = 'grid';

// ================================================
// INICIALIZACIÓN
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateStats();
    renderPodium();
    renderScorers();
    renderCharts();
    populateTeamFilter();
});

// ================================================
// FUNCIONES DE INICIALIZACIÓN
// ================================================

function initializeApp() {
    // Animaciones de entrada
    animateHeroStats();
}

function animateHeroStats() {
    const totalGoals = scorersData.reduce((sum, player) => sum + player.goals, 0);
    const totalPlayers = scorersData.length;
    const avgGoals = (totalGoals / totalPlayers).toFixed(1);
    
    animateNumber('totalGoals', 0, totalGoals, 2000);
    animateNumber('totalPlayers', 0, totalPlayers, 2000);
    animateNumberDecimal('avgGoals', 0, avgGoals, 2000);
}

function animateNumber(id, start, end, duration) {
    const element = document.getElementById(id);
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

function animateNumberDecimal(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = parseFloat(end).toFixed(1);
            clearInterval(timer);
        } else {
            element.textContent = parseFloat(current).toFixed(1);
        }
    }, 16);
}

// ================================================
// EVENT LISTENERS
// ================================================

function setupEventListeners() {
    // Filtros
    document.getElementById('competitionFilter').addEventListener('change', applyFilters);
    document.getElementById('teamFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applyFilters);
    document.getElementById('searchPlayer').addEventListener('input', applyFilters);
    
    // Vista
    document.getElementById('gridView').addEventListener('click', () => switchView('grid'));
    document.getElementById('listView').addEventListener('click', () => switchView('list'));
    
    // Menu hamburguesa (si existe en main.js)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// ================================================
// FILTROS Y BÚSQUEDA
// ================================================

function applyFilters() {
    const competition = document.getElementById('competitionFilter').value;
    const team = document.getElementById('teamFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    const search = document.getElementById('searchPlayer').value.toLowerCase();
    
    // Filtrar datos
    filteredData = scorersData.filter(player => {
        const matchCompetition = competition === 'all' || player.competition === competition;
        const matchTeam = team === 'all' || player.team === team;
        const matchSearch = player.name.toLowerCase().includes(search) || 
                          player.team.toLowerCase().includes(search);
        
        return matchCompetition && matchTeam && matchSearch;
    });
    
    // Ordenar datos
    filteredData.sort((a, b) => {
        switch(sortBy) {
            case 'goals':
                return b.goals - a.goals;
            case 'assists':
                return b.assists - a.assists;
            case 'matches':
                return b.matches - a.matches;
            case 'avg':
                return (b.goals / b.matches) - (a.goals / a.matches);
            default:
                return b.goals - a.goals;
        }
    });
    
    renderPodium();
    renderScorers();
    renderCharts();
}

function populateTeamFilter() {
    const teamFilter = document.getElementById('teamFilter');
    const teams = [...new Set(scorersData.map(player => player.team))].sort();
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });
}

function switchView(view) {
    currentView = view;
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    const scorersGrid = document.getElementById('scorersGrid');
    
    if (view === 'grid') {
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        scorersGrid.classList.remove('list-view');
    } else {
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
        scorersGrid.classList.add('list-view');
    }
}

// ================================================
// ACTUALIZAR ESTADÍSTICAS
// ================================================

function updateStats() {
    const totalGoals = scorersData.reduce((sum, player) => sum + player.goals, 0);
    const totalPlayers = scorersData.length;
    const avgGoals = (totalGoals / totalPlayers).toFixed(1);
    
    document.getElementById('totalGoals').textContent = totalGoals;
    document.getElementById('totalPlayers').textContent = totalPlayers;
    document.getElementById('avgGoals').textContent = avgGoals;
}

// ================================================
// RENDER PODIUM
// ================================================

function renderPodium() {
    const podiumContainer = document.getElementById('podiumContainer');
    const top3 = filteredData.slice(0, 3);
    
    if (top3.length < 3) {
        podiumContainer.innerHTML = '<p style="text-align: center; color: #999;">No hay suficientes datos para mostrar el podio</p>';
        return;
    }
    
    podiumContainer.innerHTML = top3.map((player, index) => {
        const position = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
        const rank = index + 1;
        const avgGoals = (player.goals / player.matches).toFixed(2);
        
        return `
            <div class="podium-item ${position}">
                <div class="podium-player-card">
                    <div class="podium-rank">${rank}</div>
                    <img src="${player.image}" alt="${player.name}" class="podium-player-img">
                    <h3 class="podium-player-name">${player.name}</h3>
                    <p class="podium-player-team">${player.teamLogo} ${player.team}</p>
                    <div class="podium-goals">
                        <div class="goals-number">${player.goals}</div>
                        <div class="goals-label">Goles</div>
                    </div>
                </div>
                <div class="podium-base">${rank}</div>
            </div>
        `;
    }).join('');
}

// ================================================
// RENDER SCORERS
// ================================================

function renderScorers() {
    const scorersGrid = document.getElementById('scorersGrid');
    
    if (filteredData.length === 0) {
        scorersGrid.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">No se encontraron goleadores</p>';
        return;
    }
    
    scorersGrid.innerHTML = filteredData.map((player, index) => {
        const rank = index + 1;
        const avgGoals = (player.goals / player.matches).toFixed(2);
        
        return `
            <div class="scorer-card fade-in-up" style="animation-delay: ${index * 0.05}s">
                <div class="scorer-header">
                    <div class="scorer-rank-badge">${rank}</div>
                    <img src="${player.image}" alt="${player.name}" class="scorer-player-img">
                    <div class="scorer-info">
                        <h3 class="scorer-name">${player.name}</h3>
                        <p class="scorer-team">${player.teamLogo} ${player.team}</p>
                    </div>
                </div>
                
                <div class="scorer-stats">
                    <div class="stat-box">
                        <div class="stat-value">${player.goals}</div>
                        <div class="stat-name">Goles</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${player.assists}</div>
                        <div class="stat-name">Asistencias</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${avgGoals}</div>
                        <div class="stat-name">Promedio</div>
                    </div>
                </div>
                
                <div class="scorer-details">
                    <div class="detail-item">
                        <i class="fas fa-futbol"></i>
                        <span>${player.matches} partidos</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-crosshairs"></i>
                        <span>${player.penalties} penales</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${player.minutesPlayed}'</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ================================================
// RENDER CHARTS
// ================================================

function renderCharts() {
    renderAvgChart();
    renderAssistsChart();
    renderTeamChart();
}

function renderAvgChart() {
    const chartContainer = document.getElementById('avgChart');
    const top5 = [...filteredData]
        .map(player => ({
            ...player,
            avg: (player.goals / player.matches)
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5);
    
    const maxAvg = Math.max(...top5.map(p => p.avg));
    
    chartContainer.innerHTML = top5.map(player => {
        const percentage = (player.avg / maxAvg) * 100;
        
        return `
            <div class="chart-bar">
                <div class="chart-bar-header">
                    <span class="chart-bar-player">${player.name}</span>
                    <span class="chart-bar-value">${player.avg.toFixed(2)}</span>
                </div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${percentage}%">
                        ${player.team}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAssistsChart() {
    const chartContainer = document.getElementById('assistsChart');
    const top5 = [...filteredData]
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 5);
    
    const maxAssists = Math.max(...top5.map(p => p.assists));
    
    chartContainer.innerHTML = top5.map(player => {
        const percentage = (player.assists / maxAssists) * 100;
        
        return `
            <div class="chart-bar">
                <div class="chart-bar-header">
                    <span class="chart-bar-player">${player.name}</span>
                    <span class="chart-bar-value">${player.assists}</span>
                </div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${percentage}%">
                        ${player.team}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTeamChart() {
    const chartContainer = document.getElementById('teamChart');
    
    // Agrupar por equipo
    const teamGoals = {};
    filteredData.forEach(player => {
        if (!teamGoals[player.team]) {
            teamGoals[player.team] = {
                team: player.team,
                logo: player.teamLogo,
                goals: 0
            };
        }
        teamGoals[player.team].goals += player.goals;
    });
    
    const top5Teams = Object.values(teamGoals)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 5);
    
    const maxGoals = Math.max(...top5Teams.map(t => t.goals));
    
    chartContainer.innerHTML = top5Teams.map(team => {
        const percentage = (team.goals / maxGoals) * 100;
        
        return `
            <div class="chart-bar">
                <div class="chart-bar-header">
                    <span class="chart-bar-player">${team.logo} ${team.team}</span>
                    <span class="chart-bar-value">${team.goals}</span>
                </div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${percentage}%">
                        ${team.goals} goles
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

console.log('🎯 Módulo de Goleadores cargado correctamente');
