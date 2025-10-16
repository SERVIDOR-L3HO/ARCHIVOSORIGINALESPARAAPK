const ULTRAGOL_API = {
    BASE_URL: 'https://ultragol-api3.onrender.com',
    
    LEAGUES: {
        'Premier League': {
            prefix: '/premier',
            displayName: 'Premier League'
        },
        'La Liga': {
            prefix: '/laliga',
            displayName: 'La Liga'
        },
        'Serie A': {
            prefix: '/seriea',
            displayName: 'Serie A'
        },
        'Bundesliga': {
            prefix: '/bundesliga',
            displayName: 'Bundesliga'
        },
        'Ligue 1': {
            prefix: '/ligue1',
            displayName: 'Ligue 1'
        },
        'Liga MX': {
            prefix: '',
            displayName: 'Liga MX'
        }
    },
    
    cache: {},
    cacheTimestamps: {},
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos

    async fetchWithCache(endpoint) {
        const now = Date.now();
        const cacheKey = endpoint.replace('/', '');

        if (this.cache[cacheKey] && (now - this.cacheTimestamps[cacheKey]) < this.CACHE_DURATION) {
            console.log(`✅ Using cached data for ${endpoint}`);
            return this.cache[cacheKey];
        }

        try {
            console.log(`🌐 Fetching data from API: ${endpoint}`);
            const response = await fetch(`${this.BASE_URL}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache[cacheKey] = data;
            this.cacheTimestamps[cacheKey] = now;
            
            return data;
        } catch (error) {
            console.error(`❌ Error fetching ${endpoint}:`, error);
            
            if (this.cache[cacheKey]) {
                console.log(`⚠️ Using stale cache for ${endpoint}`);
                return this.cache[cacheKey];
            }
            
            throw error;
        }
    },

    getLigas() {
        return Object.keys(this.LEAGUES).map(key => ({
            nombre: this.LEAGUES[key].displayName,
            prefix: this.LEAGUES[key].prefix
        }));
    },

    async getNoticiasPorLiga(ligaName) {
        const league = this.LEAGUES[ligaName];
        if (!league) return [];
        
        try {
            const endpoint = `${league.prefix}/noticias`;
            const data = await this.fetchWithCache(endpoint);
            return data.noticias || [];
        } catch (error) {
            console.warn(`⚠️ Noticias not available for ${ligaName}`);
            return [];
        }
    },

    async getTablaPorLiga(ligaName) {
        const league = this.LEAGUES[ligaName];
        if (!league) return [];
        
        try {
            const endpoint = `${league.prefix}/tabla`;
            const data = await this.fetchWithCache(endpoint);
            return data.tabla || [];
        } catch (error) {
            console.warn(`⚠️ Tabla not available for ${ligaName}`);
            return [];
        }
    },

    async getGoleadoresPorLiga(ligaName) {
        const league = this.LEAGUES[ligaName];
        if (!league) return [];
        
        try {
            const endpoint = `${league.prefix}/goleadores`;
            const data = await this.fetchWithCache(endpoint);
            return data.goleadores || [];
        } catch (error) {
            console.warn(`⚠️ Goleadores not available for ${ligaName}`);
            return [];
        }
    },

    async getAllNoticias() {
        const todasNoticias = [];
        for (const ligaName of Object.keys(this.LEAGUES)) {
            const noticias = await this.getNoticiasPorLiga(ligaName);
            todasNoticias.push(...noticias.map(n => ({ ...n, liga: ligaName })));
        }
        return todasNoticias;
    },

    async getPartidosEnVivo() {
        try {
            const response = await fetch('/api/fixtures');
            const data = await response.json();
            const fixtures = data.fixtures || [];
            
            return fixtures
                .filter(f => f.status === 'live' || f.status === 'in_progress')
                .map(f => ({
                    id: f.id,
                    equipoLocal: f.homeTeam,
                    equipoVisitante: f.awayTeam,
                    marcador: `${f.homeScore || 0} - ${f.awayScore || 0}`,
                    minuto: f.minute || '0',
                    fecha: f.date,
                    hora: new Date(f.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                }));
        } catch (error) {
            console.error('Error loading live matches:', error);
            return [];
        }
    },

    async getPartidosProximos() {
        try {
            const response = await fetch('/api/fixtures');
            const data = await response.json();
            const fixtures = data.fixtures || [];
            const now = new Date();
            
            return fixtures
                .filter(f => {
                    const matchDate = new Date(f.date);
                    return f.status === 'scheduled' && matchDate > now;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(f => ({
                    id: f.id,
                    equipoLocal: f.homeTeam,
                    equipoVisitante: f.awayTeam,
                    fecha: new Date(f.date).toLocaleDateString('es-MX', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    hora: new Date(f.date).toLocaleTimeString('es-MX', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    jornada: f.jornada,
                    estadio: f.stadium
                }));
        } catch (error) {
            console.error('Error loading upcoming matches:', error);
            return [];
        }
    },

    getTeamLogo(teamName, ligaNombre) {
        const logos = {
            'Chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
            'Arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
            'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
            'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
            'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
            'Tottenham': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
            'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
            'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
            'Atletico Madrid': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
            'Inter': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
            'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
            'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg',
            'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
            'Borussia Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
            'PSG': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
            'Paris Saint-Germain': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg'
        };
        
        return logos[teamName] || '';
    },

    clearCache() {
        this.cache = {};
        this.cacheTimestamps = {};
        console.log('🗑️ Cache cleared');
    }
};

window.ULTRAGOL_API = ULTRAGOL_API;
