const ULTRAGOL_API = {
    BASE_URL: 'https://ultragol-api3.onrender.com',
    cache: {
        todo: null,
        ligas: null,
        partidos: null,
        noticias: null,
        goleadores: null
    },
    cacheTimestamps: {
        todo: 0,
        ligas: 0,
        partidos: 0,
        noticias: 0,
        goleadores: 0
    },
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

    async getTodo() {
        return await this.fetchWithCache('/todo');
    },

    async getLigas() {
        const data = await this.getTodo();
        return data.ligas || [];
    },

    async getPartidosPorLiga(ligaNombre) {
        const data = await this.getTodo();
        if (!data.ligas) return [];
        
        const liga = data.ligas.find(l => l.nombre === ligaNombre);
        return liga ? liga.partidos || [] : [];
    },

    async getPartidosEnVivo() {
        const data = await this.getTodo();
        const partidos = [];
        
        if (data.ligas) {
            data.ligas.forEach(liga => {
                if (liga.partidos) {
                    liga.partidos.forEach(partido => {
                        if (partido.estado === 'EN VIVO' || partido.estado === 'LIVE') {
                            partidos.push({
                                ...partido,
                                ligaNombre: liga.nombre,
                                ligaLogo: liga.logo
                            });
                        }
                    });
                }
            });
        }
        
        return partidos;
    },

    async getPartidosProximos() {
        const data = await this.getTodo();
        const partidos = [];
        
        if (data.ligas) {
            data.ligas.forEach(liga => {
                if (liga.partidos) {
                    liga.partidos.forEach(partido => {
                        if (partido.estado === 'PRÓXIMO' || partido.estado === 'UPCOMING') {
                            partidos.push({
                                ...partido,
                                ligaNombre: liga.nombre,
                                ligaLogo: liga.logo
                            });
                        }
                    });
                }
            });
        }
        
        return partidos;
    },

    async getNoticias() {
        try {
            const data = await this.fetchWithCache('/noticias');
            return data.noticias || [];
        } catch (error) {
            console.warn('⚠️ Noticias endpoint not available');
            return [];
        }
    },

    async getGoleadores() {
        try {
            const data = await this.fetchWithCache('/goleadores');
            return data.goleadores || [];
        } catch (error) {
            console.warn('⚠️ Goleadores endpoint not available');
            return [];
        }
    },

    async getTablaPorLiga(ligaNombre) {
        const data = await this.getTodo();
        if (!data.ligas) return [];
        
        const liga = data.ligas.find(l => l.nombre === ligaNombre);
        return liga ? liga.tabla || [] : [];
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
        this.cache = {
            todo: null,
            ligas: null,
            partidos: null,
            noticias: null,
            goleadores: null
        };
        this.cacheTimestamps = {
            todo: 0,
            ligas: 0,
            partidos: 0,
            noticias: 0,
            goleadores: 0
        };
        console.log('🗑️ Cache cleared');
    }
};

window.ULTRAGOL_API = ULTRAGOL_API;
