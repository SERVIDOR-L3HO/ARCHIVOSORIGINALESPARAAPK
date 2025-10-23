const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// Configurar headers para evitar cache
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// API Endpoint para transmisiones en vivo
app.get('/api/transmisiones', async (req, res) => {
    try {
        const response = await fetch('https://ultragol-api3.onrender.com/transmisiones');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error al obtener transmisiones:', error);
        res.status(500).json({ error: 'Error al obtener transmisiones', transmisiones: [] });
    }
});

// API Endpoint para transmisiones filtradas por liga
app.get('/api/transmisiones/:liga', async (req, res) => {
    try {
        const response = await fetch('https://ultragol-api3.onrender.com/transmisiones');
        const data = await response.json();
        const liga = req.params.liga.toLowerCase();
        
        // Mapeo de nombres de ligas
        const ligaMap = {
            'liga-mx': 'Liga Mx',
            'premier-league': 'Premier League',
            'la-liga': 'Laliga',
            'serie-a': 'Serie A',
            'bundesliga': 'Bundesliga',
            'ligue-1': 'Ligue 1',
            'mls': 'MLS',
            'liga-pro': 'Liga Pro',
            'champions-league': 'Champions League'
        };
        
        const ligaNombre = ligaMap[liga] || liga;
        
        // Filtrar transmisiones por liga
        const transmisionesFiltradas = data.transmisiones.filter(t => {
            return t.evento && t.evento.toLowerCase().includes(ligaNombre.toLowerCase());
        });
        
        res.json({ 
            liga: ligaNombre,
            transmisiones: transmisionesFiltradas 
        });
    } catch (error) {
        console.error('Error al filtrar transmisiones:', error);
        res.status(500).json({ error: 'Error al filtrar transmisiones', transmisiones: [] });
    }
});

// Servir archivos estáticos
app.use(express.static('.', {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejo de rutas SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ULTRAGOL servidor iniciado en puerto ${PORT}`);
    console.log(`🌐 Servidor disponible en: http://0.0.0.0:${PORT}`);
    console.log('⚽ ¡Listo para recibir transmisiones de fútbol!');
});