// Bottom Navigation System
class BottomNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    init() {
        this.createBottomNav();
        this.createSettingsModal();
        this.setActivePage();
    }

    createBottomNav() {
        const nav = document.createElement('div');
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <a href="index.html" class="bottom-nav-item" data-page="index.html">
                <i class="fas fa-home"></i>
                <span>Inicio</span>
            </a>
            <a href="chat-global.html" class="bottom-nav-item" data-page="chat-global.html">
                <i class="fas fa-comments"></i>
                <span>Chat</span>
            </a>
            <a href="ULTRA/index.html" class="bottom-nav-item" data-page="ULTRA/index.html" target="_blank">
                <i class="fas fa-tv"></i>
                <span>Transmisiones</span>
            </a>
            <a href="standings.html" class="bottom-nav-item" data-page="standings.html">
                <i class="fas fa-table"></i>
                <span>Tabla</span>
            </a>
            <a href="calendario.html" class="bottom-nav-item" data-page="calendario.html">
                <i class="fas fa-calendar-alt"></i>
                <span>Calendario</span>
            </a>
            <div class="bottom-nav-item" id="settingsBtn">
                <i class="fas fa-cog"></i>
                <span>Config</span>
            </div>
        `;
        document.body.appendChild(nav);

        // Settings button click
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettingsModal();
        });
    }

    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.id = 'settingsModal';
        modal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h2><i class="fas fa-cog"></i> Configuración</h2>
                    <button class="settings-close" id="closeSettings">×</button>
                </div>
                <div class="settings-list">
                    <a href="teams.html" class="settings-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>Equipos</span>
                    </a>
                    <a href="estadisticas.html" class="settings-item">
                        <i class="fas fa-chart-bar"></i>
                        <span>Estadísticas</span>
                    </a>
                    <a href="noticias.html" class="settings-item">
                        <i class="fas fa-newspaper"></i>
                        <span>Noticias</span>
                    </a>
                    <a href="donaciones.html" class="settings-item">
                        <i class="fas fa-heart"></i>
                        <span>Donaciones</span>
                    </a>
                    <a href="team-profile.html" class="settings-item">
                        <i class="fas fa-user-circle"></i>
                        <span>Perfil de Equipo</span>
                    </a>
                    <a href="privacy-policy.html" class="settings-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>Política de Privacidad</span>
                    </a>
                    <a href="cookie-policy.html" class="settings-item">
                        <i class="fas fa-cookie-bite"></i>
                        <span>Política de Cookies</span>
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal events
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSettingsModal();
            }
        });
    }

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('active');
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('active');
    }

    setActivePage() {
        const navItems = document.querySelectorAll('.bottom-nav-item[data-page]');
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (this.currentPage === page || 
                (this.currentPage === 'index.html' && page === 'index.html') ||
                (this.currentPage === '' && page === 'index.html')) {
                item.classList.add('active');
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BottomNavigation();
});
