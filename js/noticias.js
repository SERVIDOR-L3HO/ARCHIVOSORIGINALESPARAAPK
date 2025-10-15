document.addEventListener('DOMContentLoaded', function() {
    initializeNews();
});

let newsData = [];
let filteredNews = [];
let currentCategory = 'all';

async function initializeNews() {
    await loadNewsData();
    setupNewsControls();
    setupSearchFunctionality();
    displayNews();
    updateFeaturedNews();
}

async function loadNewsData() {
    try {
        console.log('📰 Loading news from UltraGol API...');
        const apiNews = await ULTRAGOL_API.getNoticias();
        
        if (apiNews && apiNews.length > 0) {
            newsData = apiNews.map((news, index) => ({
                id: `news-${index}`,
                title: news.titulo,
                excerpt: news.descripcion || news.texto || '',
                content: news.texto || news.descripcion || '',
                category: categorizeNews(news.titulo, news.descripcion || news.texto),
                author: news.fuente || 'UltraGol',
                date: parseNewsDate(news.fecha, news.hora),
                image: news.imagen || '',
                url: news.url || '',
                featured: index === 0
            }));
            
            console.log(`✅ Loaded ${newsData.length} news from API`);
        } else {
            console.warn('⚠️ No news from API, using fallback data');
            loadFallbackNews();
        }
    } catch (error) {
        console.error('❌ Error loading news from API:', error);
        loadFallbackNews();
    }
    
    filteredNews = [...newsData];
}

function categorizeNews(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('traspaso') || text.includes('fichaje') || text.includes('refuerzo') || 
        text.includes('llega') || text.includes('contrata') || text.includes('firma')) {
        return 'transfers';
    }
    
    if (text.includes('partido') || text.includes('jornada') || text.includes('clásico') || 
        text.includes('vs') || text.includes('gol') || text.includes('victoria') || text.includes('derrota')) {
        return 'matches';
    }
    
    if (text.includes('américa') || text.includes('chivas') || text.includes('cruz azul') || 
        text.includes('tigres') || text.includes('monterrey') || text.includes('pumas') ||
        text.includes('león') || text.includes('santos') || text.includes('atlas') || 
        text.includes('toluca') || text.includes('pachuca') || text.includes('puebla') ||
        text.includes('necaxa') || text.includes('querétaro') || text.includes('tijuana') ||
        text.includes('juárez') || text.includes('mazatlán') || text.includes('san luis')) {
        return 'teams';
    }
    
    if (text.includes('jugador') || text.includes('goleador') || text.includes('delantero') || 
        text.includes('portero') || text.includes('defensa') || text.includes('mediocampista') ||
        text.includes('récord') || text.includes('marca')) {
        return 'players';
    }
    
    if (text.includes('liga mx') || text.includes('liguilla') || text.includes('torneo') || 
        text.includes('campeonato') || text.includes('tabla') || text.includes('clasificación')) {
        return 'league';
    }
    
    return 'teams';
}

function parseNewsDate(dateStr, timeStr) {
    try {
        const [day, month, year] = dateStr.split('/');
        const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        if (timeStr) {
            const cleanTime = timeStr.replace(/\s*(a\.m\.|p\.m\.)/i, '');
            const isPM = /p\.m\./i.test(timeStr);
            const [hours, minutes] = cleanTime.trim().split(':');
            let hour = parseInt(hours);
            
            if (isPM && hour !== 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
            
            return new Date(`${dateString}T${hour.toString().padStart(2, '0')}:${minutes}:00`).toISOString();
        }
        
        return new Date(dateString).toISOString();
    } catch (error) {
        console.error('Error parsing date:', error);
        return new Date().toISOString();
    }
}

function loadFallbackNews() {
    newsData = [
        {
            id: 'news-1',
            title: 'América refuerza su plantilla con nuevo delantero internacional',
            excerpt: 'Las Águilas del América confirman la llegada de un nuevo delantero que promete dar muchas alegrías a la afición azulcrema en esta temporada.',
            category: 'transfers',
            author: 'Juan Carlos Pérez',
            date: '2025-09-02T14:30:00Z',
            image: '',
            featured: false
        },
        {
            id: 'news-2',
            title: 'Tigres UANL prepara gran remontada en la tabla general',
            excerpt: 'Los felinos buscan escalar posiciones en la tabla general después de un inicio complicado, confiando en su experiencia y calidad de plantel.',
            category: 'teams',
            author: 'María González',
            date: '2025-09-02T12:15:00Z',
            image: '',
            featured: false
        },
        {
            id: 'news-3',
            title: 'Clásico Nacional: Todo listo para el América vs Chivas',
            excerpt: 'El partido más esperado del fútbol mexicano se acerca. Ambos equipos llegan en gran forma y prometen un espectáculo inolvidable para los aficionados.',
            category: 'matches',
            author: 'Roberto Martínez',
            date: '2025-09-02T10:45:00Z',
            image: '',
            featured: true
        }
    ];
}

function setupNewsControls() {
    const filterButtons = document.querySelectorAll('.filter-tag');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            filterNewsByCategory(category);
            updateActiveFilter(button);
        });
    });
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('newsSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchNews(query);
        });
    }
}

function filterNewsByCategory(category) {
    currentCategory = category;
    
    if (category === 'all') {
        filteredNews = [...newsData];
    } else {
        filteredNews = newsData.filter(news => news.category === category);
    }
    
    displayNews();
}

function searchNews(query) {
    if (!query) {
        filterNewsByCategory(currentCategory);
        return;
    }
    
    filteredNews = newsData.filter(news => {
        const matchesCategory = currentCategory === 'all' || news.category === currentCategory;
        const matchesQuery = news.title.toLowerCase().includes(query) ||
                           news.excerpt.toLowerCase().includes(query) ||
                           news.author.toLowerCase().includes(query);
        
        return matchesCategory && matchesQuery;
    });
    
    displayNews();
}

function updateActiveFilter(activeButton) {
    document.querySelectorAll('.filter-tag').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

function displayNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No se encontraron noticias</h3>
                <p style="color: #999;">Intenta con otros términos de búsqueda o categorías</p>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .no-news {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
        `;
        if (!document.getElementById('no-news-styles')) {
            style.id = 'no-news-styles';
            document.head.appendChild(style);
        }
        
        return;
    }
    
    newsGrid.innerHTML = filteredNews.map((news, index) => 
        createNewsCard(news, index)
    ).join('');
    
    animateNewsCards();
}

function createNewsCard(news, index) {
    const categoryIcons = {
        transfers: 'fas fa-exchange-alt',
        matches: 'fas fa-futbol',
        teams: 'fas fa-shield-alt',
        players: 'fas fa-user',
        league: 'fas fa-trophy'
    };
    
    const categoryNames = {
        transfers: 'TRASPASOS',
        matches: 'PARTIDOS',
        teams: 'EQUIPOS',
        players: 'JUGADORES',
        league: 'LIGA'
    };
    
    const timeAgo = calculateTimeAgo(news.date);
    const imageStyle = news.image ? 
        `background: url('${news.image}') center/cover; position: relative;` : 
        `background: linear-gradient(45deg, #ff9933, #ffaa44);`;
    
    return `
        <div class="news-card stagger-item" style="animation-delay: ${index * 0.1}s" onclick="openNewsDetail('${news.id}')">
            <div class="news-image" style="${imageStyle}">
                ${!news.image ? `<i class="${categoryIcons[news.category] || 'fas fa-newspaper'}"></i>` : ''}
                <div class="news-category">${categoryNames[news.category] || 'NOTICIAS'}</div>
            </div>
            <div class="news-content">
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <div class="news-meta">
                    <div class="news-date">
                        <i class="fas fa-clock"></i>
                        ${timeAgo}
                    </div>
                    <div class="news-author">${news.author}</div>
                </div>
            </div>
        </div>
    `;
}

function updateFeaturedNews() {
    if (newsData.length === 0) return;
    
    const featuredNews = newsData[0];
    const featuredArticle = document.querySelector('.featured-article');
    
    if (!featuredArticle) return;
    
    const categoryNames = {
        transfers: 'TRASPASOS',
        matches: 'PARTIDOS',
        teams: 'EQUIPOS',
        players: 'JUGADORES',
        league: 'LIGA'
    };
    
    const imageStyle = featuredNews.image ? 
        `background: url('${featuredNews.image}') center/cover;` : 
        `background: linear-gradient(45deg, #ff9933, #ffaa44);`;
    
    featuredArticle.innerHTML = `
        <div class="featured-image" style="${imageStyle}">
            ${!featuredNews.image ? '<i class="fas fa-newspaper"></i>' : ''}
            <div class="featured-category">DESTACADO</div>
        </div>
        <div class="featured-content">
            <div class="featured-category">${categoryNames[featuredNews.category] || 'NOTICIAS'}</div>
            <h2 class="featured-title">${featuredNews.title}</h2>
            <p class="featured-excerpt">${featuredNews.excerpt}</p>
            <button class="read-more-btn" onclick="openNewsDetail('${featuredNews.id}')">
                Leer más <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

function animateNewsCards() {
    const cards = document.querySelectorAll('.news-card.stagger-item');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function calculateTimeAgo(dateString) {
    const now = new Date();
    const newsDate = new Date(dateString);
    const diffInMs = now - newsDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
        return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
        return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    }
}

function openNewsDetail(newsId) {
    const news = newsData.find(n => n.id === newsId);
    
    if (!news) {
        showNewsMessage('Noticia no encontrada', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    
    const categoryNames = {
        transfers: 'TRASPASOS',
        matches: 'PARTIDOS',
        teams: 'EQUIPOS',
        players: 'JUGADORES',
        league: 'LIGA'
    };
    
    const imageStyle = news.image ? 
        `background: url('${news.image}') center/cover;` : 
        `background: linear-gradient(45deg, #ff9933, #ffaa44);`;
    
    modal.innerHTML = `
        <div class="news-modal-content">
            <div class="news-modal-header">
                <button class="close-news-modal">&times;</button>
            </div>
            <div class="news-modal-body">
                <div class="news-modal-category">${categoryNames[news.category] || 'NOTICIAS'}</div>
                <h2 class="news-modal-title">${news.title}</h2>
                <div class="news-modal-meta">
                    <span class="news-modal-author">Por ${news.author}</span>
                    <span class="news-modal-date">${formatDate(news.date)}</span>
                </div>
                <div class="news-modal-image" style="${imageStyle}">
                    ${!news.image ? '<i class="fas fa-newspaper"></i>' : ''}
                </div>
                <div class="news-modal-content-text">
                    <p>${news.excerpt}</p>
                    ${news.content ? `<p>${news.content}</p>` : ''}
                    
                    ${news.url ? `
                        <div style="margin: 25px 0;">
                            <a href="${news.url}" target="_blank" rel="noopener noreferrer" 
                               style="display: inline-block; padding: 12px 25px; background: linear-gradient(45deg, #ff9933, #ffaa44); 
                               color: white; text-decoration: none; border-radius: 25px; font-weight: 600; transition: all 0.3s ease;">
                                Ver noticia completa <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    ` : ''}
                    
                    <div class="news-modal-share">
                        <h4>Compartir esta noticia:</h4>
                        <div class="share-buttons">
                            <button class="share-btn facebook" onclick="shareOnFacebook('${news.url || window.location.href}')">
                                <i class="fab fa-facebook"></i> Facebook
                            </button>
                            <button class="share-btn twitter" onclick="shareOnTwitter('${news.title}', '${news.url || window.location.href}')">
                                <i class="fab fa-twitter"></i> Twitter
                            </button>
                            <button class="share-btn whatsapp" onclick="shareOnWhatsApp('${news.title}', '${news.url || window.location.href}')">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        overflow-y: auto;
        padding: 20px;
    `;
    
    const modalContent = modal.querySelector('.news-modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    `;
    
    if (!document.getElementById('news-modal-styles')) {
        addNewsModalStyles();
    }
    
    const closeButton = modal.querySelector('.close-news-modal');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.body.appendChild(modal);
}

function shareOnFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnTwitter(title, url) {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnWhatsApp(title, url) {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

function addNewsModalStyles() {
    const style = document.createElement('style');
    style.id = 'news-modal-styles';
    style.textContent = `
        .news-modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
        }
        
        .close-news-modal {
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 1.5rem;
            transition: all 0.3s ease;
        }
        
        .close-news-modal:hover {
            background: #c82333;
            transform: scale(1.1);
        }
        
        .news-modal-body {
            padding: 30px;
        }
        
        .news-modal-category {
            background: #ff9933;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .news-modal-title {
            font-size: 2rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        
        .news-modal-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
            font-size: 0.9rem;
            color: #666;
        }
        
        .news-modal-author {
            font-weight: 600;
            color: #ff9933;
        }
        
        .news-modal-image {
            height: 200px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
            margin-bottom: 25px;
        }
        
        .news-modal-content-text {
            line-height: 1.6;
            color: #333;
        }
        
        .news-modal-content-text p {
            margin-bottom: 15px;
        }
        
        .news-modal-content-text h3 {
            color: #ff9933;
            margin: 25px 0 15px 0;
        }
        
        .news-modal-content-text ul {
            margin-bottom: 25px;
            padding-left: 20px;
        }
        
        .news-modal-content-text li {
            margin-bottom: 8px;
        }
        
        .news-modal-share {
            background: #f8f8f8;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
        }
        
        .news-modal-share h4 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .share-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .share-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .share-btn.facebook {
            background: #1877f2;
        }
        
        .share-btn.twitter {
            background: #1da1f2;
        }
        
        .share-btn.whatsapp {
            background: #25d366;
        }
        
        .share-btn:hover {
            transform: translateY(-2px);
            opacity: 0.9;
        }
        
        @media (max-width: 768px) {
            .news-modal-title {
                font-size: 1.5rem;
            }
            
            .news-modal-body {
                padding: 20px;
            }
            
            .share-buttons {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
}

function showNewsMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `news-message news-message-${type}`;
    messageDiv.textContent = message;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, 3000);
}

window.newsApp = {
    filterNewsByCategory,
    searchNews,
    openNewsDetail,
    displayNews
};
