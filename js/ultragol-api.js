const ULTRAGOL_API = {
    BASE_URL: 'https://ultragol-api3.onrender.com',
    cache: {
        tabla: null,
        equipos: null,
        noticias: null,
        goleadores: null,
        todo: null,
        videos: null
    },
    cacheTimestamps: {
        tabla: 0,
        equipos: 0,
        noticias: 0,
        goleadores: 0,
        todo: 0,
        videos: 0
    },
    CACHE_DURATION: 30 * 60 * 1000,

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

    async getTabla() {
        const data = await this.fetchWithCache('/tabla');
        return this.transformTablaData(data);
    },

    async getEquipos() {
        const data = await this.fetchWithCache('/equipos');
        return this.transformEquiposData(data);
    },

    async getNoticias() {
        const data = await this.fetchWithCache('/noticias');
        return data.noticias || [];
    },

    async getGoleadores() {
        const data = await this.fetchWithCache('/goleadores');
        return data.goleadores || [];
    },

    async getTodo() {
        return await this.fetchWithCache('/todo');
    },

    async getVideos() {
        try {
            const data = await this.fetchWithCache('/videos');
            return data.videos || data || [];
        } catch (error) {
            console.warn('⚠️ Videos endpoint not available, using fallback');
            return [];
        }
    },

    // Nota: La API de UltraGol actualmente no proporciona un endpoint de fixtures/partidos
    // Los fixtures se siguen cargando desde el archivo JSON local data/fixtures.json
    // Cuando la API agregue un endpoint de fixtures, se puede integrar aquí

    transformTablaData(apiData) {
        if (!apiData || !apiData.tabla) return [];
        
        return apiData.tabla.map(team => ({
            id: this.normalizeTeamName(team.equipo),
            name: team.equipo,
            position: team.posicion,
            played: team.estadisticas.pj,
            wins: team.estadisticas.pg,
            draws: team.estadisticas.pe,
            losses: team.estadisticas.pp,
            goalsFor: team.estadisticas.gf,
            goalsAgainst: team.estadisticas.gc,
            goalDifference: team.estadisticas.dif,
            points: team.estadisticas.pts
        }));
    },

    transformEquiposData(apiData) {
        if (!apiData || !apiData.equipos) return [];
        
        return apiData.equipos.map(team => ({
            id: this.normalizeTeamName(team.nombre),
            name: team.nombre,
            shortName: team.nombreCorto,
            url: team.url,
            liga: team.liga,
            logo: this.getTeamLogo(team.nombre),
            colors: this.getTeamColors(team.nombre),
            nickname: this.getTeamNickname(team.nombre),
            city: this.getTeamCity(team.nombre),
            stadium: this.getTeamStadium(team.nombre),
            founded: this.getTeamFounded(team.nombre),
            capacity: this.getTeamCapacity(team.nombre),
            region: this.getTeamRegion(team.nombre),
            titles: this.getTeamTitles(team.nombre)
        }));
    },

    normalizeTeamName(name) {
        return name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
    },

    getTeamLogo(teamName) {
        const logos = {
            'América': 'assets/logos/america.png',
            'Guadalajara': 'assets/logos/chivas.png',
            'Cruz Azul': 'assets/logos/cruz-azul.png',
            'Monterrey': 'assets/logos/monterrey.png',
            'Tigres': 'assets/logos/tigres.png',
            'Pumas': 'assets/logos/pumas.png',
            'León': 'assets/logos/leon.png',
            'Santos': 'assets/logos/santos.png',
            'Toluca': 'assets/logos/toluca.png',
            'Atlas': 'assets/logos/atlas.png',
            'Pachuca': 'assets/logos/pachuca.png',
            'Tijuana': 'assets/logos/tijuana.png',
            'Querétaro': 'assets/logos/queretaro.png',
            'Puebla': 'assets/logos/puebla.png',
            'Necaxa': 'assets/logos/necaxa.png',
            'Juárez': 'assets/logos/fc-juarez.png',
            'Mazatlán': 'assets/logos/mazatlan.png',
            'Atlético de San Luis': 'assets/logos/atletico-san-luis.png',
            'Atl. San Luis': 'assets/logos/atletico-san-luis.png'
        };
        return logos[teamName] || '';
    },

    getTeamColors(teamName) {
        const colors = {
            'América': { primary: '#FFD700', secondary: '#003087' },
            'Guadalajara': { primary: '#E31E24', secondary: '#FFFFFF' },
            'Cruz Azul': { primary: '#0067B1', secondary: '#FFFFFF' },
            'Monterrey': { primary: '#003087', secondary: '#FFFFFF' },
            'Tigres': { primary: '#FFB81C', secondary: '#003087' },
            'Pumas': { primary: '#002D62', secondary: '#C4A962' },
            'León': { primary: '#00843D', secondary: '#FFFFFF' },
            'Santos': { primary: '#006341', secondary: '#FFFFFF' },
            'Toluca': { primary: '#E31E24', secondary: '#FFFFFF' },
            'Atlas': { primary: '#E31E24', secondary: '#000000' },
            'Pachuca': { primary: '#003087', secondary: '#FFFFFF' },
            'Tijuana': { primary: '#E31E24', secondary: '#000000' },
            'Querétaro': { primary: '#003087', secondary: '#000000' },
            'Puebla': { primary: '#003087', secondary: '#FFFFFF' },
            'Necaxa': { primary: '#E31E24', secondary: '#FFFFFF' },
            'Juárez': { primary: '#E31E24', secondary: '#008C45' },
            'Mazatlán': { primary: '#663399', secondary: '#FFFFFF' },
            'Atlético de San Luis': { primary: '#E31E24', secondary: '#003087' }
        };
        return colors[teamName] || { primary: '#003087', secondary: '#FFFFFF' };
    },

    getTeamNickname(teamName) {
        const nicknames = {
            'América': 'Las Águilas',
            'Guadalajara': 'El Rebaño Sagrado',
            'Cruz Azul': 'La Máquina',
            'Monterrey': 'Los Rayados',
            'Tigres': 'Los Tigres',
            'Pumas': 'Los Universitarios',
            'León': 'La Fiera',
            'Santos': 'Los Guerreros',
            'Toluca': 'Los Diablos Rojos',
            'Atlas': 'Los Rojinegros',
            'Pachuca': 'Los Tuzos',
            'Tijuana': 'Los Xolos',
            'Querétaro': 'Los Gallos Blancos',
            'Puebla': 'La Franja',
            'Necaxa': 'Los Rayos',
            'Juárez': 'Los Bravos',
            'Mazatlán': 'Los Cañoneros',
            'Atlético de San Luis': 'Los Rojiblancos'
        };
        return nicknames[teamName] || teamName;
    },

    getTeamCity(teamName) {
        const cities = {
            'América': 'Ciudad de México',
            'Guadalajara': 'Guadalajara',
            'Cruz Azul': 'Ciudad de México',
            'Monterrey': 'Monterrey',
            'Tigres': 'Monterrey',
            'Pumas': 'Ciudad de México',
            'León': 'León',
            'Santos': 'Torreón',
            'Toluca': 'Toluca',
            'Atlas': 'Guadalajara',
            'Pachuca': 'Pachuca',
            'Tijuana': 'Tijuana',
            'Querétaro': 'Querétaro',
            'Puebla': 'Puebla',
            'Necaxa': 'Aguascalientes',
            'Juárez': 'Ciudad Juárez',
            'Mazatlán': 'Mazatlán',
            'Atlético de San Luis': 'San Luis Potosí'
        };
        return cities[teamName] || '';
    },

    getTeamStadium(teamName) {
        const stadiums = {
            'América': 'Estadio Azteca',
            'Guadalajara': 'Estadio Akron',
            'Cruz Azul': 'Estadio Ciudad de los Deportes',
            'Monterrey': 'Estadio BBVA',
            'Tigres': 'Estadio Universitario',
            'Pumas': 'Estadio Olímpico Universitario',
            'León': 'Estadio León',
            'Santos': 'Estadio Corona',
            'Toluca': 'Estadio Nemesio Díez',
            'Atlas': 'Estadio Jalisco',
            'Pachuca': 'Estadio Hidalgo',
            'Tijuana': 'Estadio Caliente',
            'Querétaro': 'Estadio La Corregidora',
            'Puebla': 'Estadio Cuauhtémoc',
            'Necaxa': 'Estadio Victoria',
            'Juárez': 'Estadio Olímpico Benito Juárez',
            'Mazatlán': 'Estadio Kraken',
            'Atlético de San Luis': 'Estadio Alfonso Lastras'
        };
        return stadiums[teamName] || '';
    },

    getTeamFounded(teamName) {
        const founded = {
            'América': '1916',
            'Guadalajara': '1906',
            'Cruz Azul': '1927',
            'Monterrey': '1945',
            'Tigres': '1960',
            'Pumas': '1954',
            'León': '1944',
            'Santos': '1983',
            'Toluca': '1917',
            'Atlas': '1916',
            'Pachuca': '1901',
            'Tijuana': '2007',
            'Querétaro': '1950',
            'Puebla': '1944',
            'Necaxa': '1923',
            'Juárez': '2015',
            'Mazatlán': '2020',
            'Atlético de San Luis': '2013'
        };
        return founded[teamName] || '';
    },

    getTeamCapacity(teamName) {
        const capacities = {
            'América': '87,000',
            'Guadalajara': '46,355',
            'Cruz Azul': '35,000',
            'Monterrey': '53,500',
            'Tigres': '42,000',
            'Pumas': '72,000',
            'León': '31,297',
            'Santos': '30,000',
            'Toluca': '30,000',
            'Atlas': '55,020',
            'Pachuca': '30,000',
            'Tijuana': '27,333',
            'Querétaro': '45,575',
            'Puebla': '47,000',
            'Necaxa': '23,000',
            'Juárez': '19,703',
            'Mazatlán': '20,108',
            'Atlético de San Luis': '25,709'
        };
        return capacities[teamName] || '';
    },

    getTeamRegion(teamName) {
        const regions = {
            'América': 'central',
            'Guadalajara': 'occidente',
            'Cruz Azul': 'central',
            'Monterrey': 'norte',
            'Tigres': 'norte',
            'Pumas': 'central',
            'León': 'occidente',
            'Santos': 'norte',
            'Toluca': 'central',
            'Atlas': 'occidente',
            'Pachuca': 'central',
            'Tijuana': 'norte',
            'Querétaro': 'central',
            'Puebla': 'central',
            'Necaxa': 'central',
            'Juárez': 'norte',
            'Mazatlán': 'occidente',
            'Atlético de San Luis': 'central'
        };
        return regions[teamName] || 'central';
    },

    getTeamTitles(teamName) {
        const titles = {
            'América': 15,
            'Guadalajara': 12,
            'Cruz Azul': 9,
            'Monterrey': 5,
            'Tigres': 8,
            'Pumas': 7,
            'León': 8,
            'Santos': 6,
            'Toluca': 10,
            'Atlas': 1,
            'Pachuca': 7,
            'Tijuana': 1,
            'Querétaro': 1,
            'Puebla': 1,
            'Necaxa': 3,
            'Juárez': 0,
            'Mazatlán': 0,
            'Atlético de San Luis': 0
        };
        return titles[teamName] || 0;
    },

    clearCache() {
        this.cache = {
            tabla: null,
            equipos: null,
            noticias: null,
            goleadores: null,
            todo: null,
            videos: null
        };
        this.cacheTimestamps = {
            tabla: 0,
            equipos: 0,
            noticias: 0,
            goleadores: 0,
            todo: 0,
            videos: 0
        };
        console.log('🗑️ Cache cleared');
    }
};

window.ULTRAGOL_API = ULTRAGOL_API;
