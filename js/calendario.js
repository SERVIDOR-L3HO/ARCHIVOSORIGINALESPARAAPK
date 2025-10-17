// Enhanced Multi-League Calendar JavaScript for UltraGol by L3HO
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
});

// Variables globales
let currentJornada = 1;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentView = 'jornada';
let currentLeague = 'ligamx';
let allLeagueMatches = {};
let calendarTeamsData = [];
let selectedTeam = '';

const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const leagueNames = {
    'ligamx': 'Liga MX',
    'premier': 'Premier League',
    'laliga': 'La Liga',
    'seriea': 'Serie A',
    'bundesliga': 'Bundesliga',
    'ligue1': 'Ligue 1'
};

// Inicializar sistema de calendario
async function initializeCalendar() {
    try {
        await loadAllLeaguesData();
        setupLeagueTabs();
        setupViewControls();
        setupFilters();
        populateTeamFilter();
        displayCurrentView();
    } catch (error) {
        console.error('❌ Error inicializando calendario:', error);
        showErrorMessage('Error al cargar el calendario');
    }
}

// Cargar datos de todas las ligas
async function loadAllLeaguesData() {
    try {
        const leagues = ['ligamx', 'premier', 'laliga', 'seriea', 'bundesliga', 'ligue1'];
        
        for (const league of leagues) {
            const response = await fetch(`/api/fixtures/${league}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const data = await response.json();
            allLeagueMatches[league] = data.fixtures || [];
        }
        
        console.log('✅ Datos de todas las ligas cargados:', Object.keys(allLeagueMatches));
        return allLeagueMatches;
    } catch (error) {
        console.error('❌ Error cargando datos de ligas:', error);
        // Fallback a datos vacíos
        allLeagueMatches = {
            ligamx: [],
            premier: [],
            laliga: [],
            seriea: [],
            bundesliga: [],
            ligue1: []
        };
        return allLeagueMatches;
    }
}

// Configurar tabs de ligas
function setupLeagueTabs() {
    const leagueTabs = document.querySelectorAll('.league-tab');
    
    leagueTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const league = tab.dataset.league;
            if (league && league !== currentLeague) {
                currentLeague = league;
                
                // Actualizar tabs activos
                leagueTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Resetear a jornada 1
                currentJornada = 1;
                
                // Actualizar vista
                populateTeamFilter();
                displayCurrentView();
            }
        });
    });
}

// Configurar controles de vista
function setupViewControls() {
    const jornadaViewBtn = document.getElementById('jornadaView');
    const monthViewBtn = document.getElementById('monthView');
    
    if (jornadaViewBtn) {
        jornadaViewBtn.addEventListener('click', () => {
            switchView('jornada');
        });
    }
    
    if (monthViewBtn) {
        monthViewBtn.addEventListener('click', () => {
            switchView('month');
        });
    }
    
    // Controles de navegación de jornada
    const prevButton = document.getElementById('prevJornada');
    const nextButton = document.getElementById('nextJornada');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentJornada > 1) {
                currentJornada--;
                displayJornadaView();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const maxJornada = getMaxJornada();
            if (currentJornada < maxJornada) {
                currentJornada++;
                displayJornadaView();
            }
        });
    }
    
    // Controles de mes
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    
    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            displayMonthView();
        });
    }
    
    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            displayMonthView();
        });
    }
}

// Configurar filtros
function setupFilters() {
    const teamFilter = document.getElementById('teamFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (teamFilter) {
        teamFilter.addEventListener('change', (e) => {
            selectedTeam = e.target.value;
            displayCurrentView();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            clearAllFilters();
        });
    }
}

// Obtener partidos de la liga actual
function getCurrentLeagueMatches() {
    return allLeagueMatches[currentLeague] || [];
}

// Obtener máxima jornada
function getMaxJornada() {
    const matches = getCurrentLeagueMatches();
    if (matches.length === 0) return 1;
    
    const jornadas = matches.map(m => m.jornada || 1);
    return Math.max(...jornadas);
}

// Obtener partidos por jornada
function getMatchesByJornada(jornadaNum) {
    const matches = getCurrentLeagueMatches();
    let jornadaMatches = matches.filter(m => m.jornada === jornadaNum);
    
    // Aplicar filtro de equipo si está seleccionado
    if (selectedTeam) {
        jornadaMatches = jornadaMatches.filter(m => 
            m.homeTeam === selectedTeam || m.awayTeam === selectedTeam
        );
    }
    
    return jornadaMatches;
}

// Mostrar vista actual
function displayCurrentView() {
    if (currentView === 'jornada') {
        displayJornadaView();
    } else {
        displayMonthView();
    }
}

// Mostrar vista de jornadas
function displayJornadaView() {
    const matches = getMatchesByJornada(currentJornada);
    
    // Actualizar título
    const currentJornadaElement = document.getElementById('currentJornada');
    if (currentJornadaElement) {
        currentJornadaElement.textContent = `JORNADA ${currentJornada}`;
    }
    
    // Actualizar fechas (obtener rango de fechas de los partidos)
    const jornadaDatesElement = document.getElementById('jornadaDates');
    if (jornadaDatesElement && matches.length > 0) {
        const dates = matches.map(m => new Date(m.date)).sort((a, b) => a - b);
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        
        if (firstDate.toDateString() === lastDate.toDateString()) {
            jornadaDatesElement.textContent = formatDate(firstDate);
        } else {
            jornadaDatesElement.textContent = `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
        }
    } else if (jornadaDatesElement) {
        jornadaDatesElement.textContent = '';
    }
    
    // Generar selector de jornadas
    generateJornadasSelector();
    
    // Mostrar partidos
    displayPartidos(matches);
    
    // Actualizar botones de navegación
    updateNavButtons();
}

// Generar selector de jornadas
function generateJornadasSelector() {
    const selector = document.getElementById('jornadasSelector');
    if (!selector) return;
    
    selector.innerHTML = '';
    
    const maxJornada = getMaxJornada();
    
    for (let i = 1; i <= maxJornada; i++) {
        const button = document.createElement('button');
        button.className = 'jornada-btn';
        if (i === currentJornada) {
            button.classList.add('active');
        }
        button.textContent = `J${i}`;
        
        button.addEventListener('click', () => {
            currentJornada = i;
            displayJornadaView();
        });
        
        selector.appendChild(button);
    }
}

// Mostrar partidos
function displayPartidos(matches) {
    const matchesGrid = document.getElementById('matchesGrid');
    if (!matchesGrid) return;
    
    matchesGrid.innerHTML = '';
    
    if (matches.length === 0) {
        matchesGrid.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-calendar-times"></i>
                <h3>No hay partidos</h3>
                <p>No se encontraron partidos para esta jornada</p>
            </div>
        `;
        return;
    }
    
    matches.forEach(match => {
        const card = createPartidoCard(match);
        matchesGrid.appendChild(card);
    });
}

// Crear tarjeta de partido
function createPartidoCard(match) {
    const card = document.createElement('div');
    card.className = 'partido-card';
    
    const matchDate = new Date(match.date);
    const dayName = days[matchDate.getDay()];
    const dateStr = matchDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    const timeStr = matchDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    
    card.innerHTML = `
        <div class="partido-header">
            <div class="partido-dia">${dayName} ${dateStr}</div>
            <div class="partido-hora">${timeStr}</div>
        </div>
        <div class="partido-teams">
            <div class="team-partido">
                <div class="team-logo-small">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="team-name-small">${match.homeTeam}</div>
            </div>
            <div class="vs-small">VS</div>
            <div class="team-partido">
                <div class="team-logo-small">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="team-name-small">${match.awayTeam}</div>
            </div>
        </div>
        <div class="partido-estadio">
            <i class="fas fa-map-marker-alt"></i>
            ${match.stadium || 'Estadio por confirmar'}
        </div>
    `;
    
    return card;
}

// Mostrar vista mensual
function displayMonthView() {
    const currentMonthElement = document.getElementById('currentMonth');
    if (currentMonthElement) {
        currentMonthElement.textContent = `${months[currentMonth]} ${currentYear}`;
    }
    
    generateCalendarGrid();
}

// Generar cuadrícula del calendario
function generateCalendarGrid() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    calendarGrid.innerHTML = '';
    
    // Agregar encabezados de días
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Obtener primer día del mes
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dayElement = createCalendarDay(day, true);
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del mes actual
    const today = new Date();
    const matches = getCurrentLeagueMatches();
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        
        // Filtrar partidos del día
        let dayMatches = matches.filter(match => {
            const matchDate = new Date(match.date);
            return matchDate.toDateString() === date.toDateString();
        });
        
        // Aplicar filtro de equipo
        if (selectedTeam) {
            dayMatches = dayMatches.filter(m => 
                m.homeTeam === selectedTeam || m.awayTeam === selectedTeam
            );
        }
        
        const dayElement = createCalendarDay(day, false, isToday, dayMatches);
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del siguiente mes
    const remainingCells = 42 - calendarGrid.children.length + 7; // +7 para los headers
    for (let day = 1; day <= remainingCells - 7; day++) {
        const dayElement = createCalendarDay(day, true);
        calendarGrid.appendChild(dayElement);
    }
}

// Crear día del calendario
function createCalendarDay(day, otherMonth = false, isToday = false, matches = []) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (otherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    if (matches.length > 0 && !otherMonth) {
        const matchesContainer = document.createElement('div');
        matchesContainer.className = 'day-matches';
        
        matches.slice(0, 3).forEach(match => {
            const matchElement = document.createElement('div');
            matchElement.className = 'day-match';
            matchElement.textContent = `${match.homeTeam.substring(0, 3)} vs ${match.awayTeam.substring(0, 3)}`;
            matchesContainer.appendChild(matchElement);
        });
        
        if (matches.length > 3) {
            const moreElement = document.createElement('div');
            moreElement.className = 'day-match';
            moreElement.textContent = `+${matches.length - 3} más`;
            matchesContainer.appendChild(moreElement);
        }
        
        dayElement.appendChild(matchesContainer);
    }
    
    return dayElement;
}

// Cambiar vista
function switchView(viewType) {
    currentView = viewType;
    
    const jornadaViewBtn = document.getElementById('jornadaView');
    const monthViewBtn = document.getElementById('monthView');
    const jornadaSection = document.getElementById('jornadaSection');
    const monthSection = document.getElementById('monthSection');
    
    // Actualizar botones
    if (jornadaViewBtn && monthViewBtn) {
        jornadaViewBtn.classList.toggle('active', viewType === 'jornada');
        monthViewBtn.classList.toggle('active', viewType === 'month');
    }
    
    // Mostrar/ocultar secciones
    if (jornadaSection && monthSection) {
        if (viewType === 'jornada') {
            jornadaSection.style.display = 'block';
            monthSection.classList.remove('active');
            displayJornadaView();
        } else {
            jornadaSection.style.display = 'none';
            monthSection.classList.add('active');
            displayMonthView();
        }
    }
}

// Poblar filtro de equipos
function populateTeamFilter() {
    const teamFilter = document.getElementById('teamFilter');
    if (!teamFilter) return;
    
    teamFilter.innerHTML = '<option value="">Todos los equipos</option>';
    
    const matches = getCurrentLeagueMatches();
    const teams = new Set();
    
    matches.forEach(match => {
        teams.add(match.homeTeam);
        teams.add(match.awayTeam);
    });
    
    Array.from(teams).sort().forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });
}

// Limpiar filtros
function clearAllFilters() {
    selectedTeam = '';
    
    const teamFilter = document.getElementById('teamFilter');
    if (teamFilter) teamFilter.value = '';
    
    displayCurrentView();
}

// Actualizar botones de navegación
function updateNavButtons() {
    const prevButton = document.getElementById('prevJornada');
    const nextButton = document.getElementById('nextJornada');
    
    if (prevButton) {
        prevButton.disabled = currentJornada <= 1;
    }
    
    if (nextButton) {
        const maxJornada = getMaxJornada();
        nextButton.disabled = currentJornada >= maxJornada;
    }
}

// Formatear fecha
function formatDate(date) {
    return date.toLocaleDateString('es-MX', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    const matchesGrid = document.getElementById('matchesGrid');
    if (matchesGrid) {
        matchesGrid.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}
