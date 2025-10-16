class VideosCarousel {
    constructor() {
        this.currentIndex = 0;
        this.videosData = [];
        this.cardsPerView = 1;
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.playingVideoId = null;
        this.init();
    }

    async init() {
        await this.loadVideos();
        this.render();
        this.setupEventListeners();
    }

    async loadVideos() {
        try {
            console.log('📺 Cargando videos desde servidor local...');
            
            const response = await fetch('/api/videos');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.videosData = await response.json();
            console.log('✅ Videos cargados exitosamente:', this.videosData.length);
            
            if (this.videosData.length > 0) {
                console.log('📹 Primer video:', this.videosData[0]);
            }
        } catch (error) {
            console.error('❌ Error al cargar videos:', error);
            this.videosData = [];
        }
    }

    render() {
        const track = document.getElementById('videosCarouselTrack');
        if (!track || this.videosData.length === 0) {
            console.warn('⚠️ No hay videos para mostrar o elemento no encontrado');
            return;
        }

        track.innerHTML = this.videosData.map(video => {
            const titulo = video.partido || video.title || 'Video de Liga MX';
            const equipo = video.equipo || video.team || 'Liga MX';
            const fecha = video.fecha || video.date || 'Temporada 2025';
            const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${this.extractVideoId(video.link)}/maxresdefault.jpg`;
            
            return `
                <div class="video-card" data-video-id="${video.id}">
                    <div class="video-content-wrapper" id="video-content-${video.id}">
                        <div class="video-thumbnail-wrapper">
                            <img src="${thumbnail}" 
                                 alt="${titulo}" 
                                 class="video-thumbnail" 
                                 loading="lazy"
                                 onerror="this.src='https://via.placeholder.com/800x450/1a1f3a/ffffff?text=Liga+MX'">
                            <div class="video-play-overlay">
                                <i class="fas fa-play"></i>
                            </div>
                            <span class="video-tipo-badge">${video.tipo === 'video' ? 'YouTube' : 'Externo'}</span>
                        </div>
                        <div class="video-info">
                            <h3 class="video-title">${titulo}</h3>
                            <div class="video-meta">
                                <span class="video-equipo">
                                    <i class="fas fa-shield-alt"></i>
                                    ${equipo}
                                </span>
                                <span class="video-fecha">${fecha}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.updateDots();
        this.updateButtons();
        
        console.log('✅ Carrusel renderizado con', this.videosData.length, 'videos');
    }

    extractVideoId(url) {
        if (!url) return '';
        const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : '';
    }

    updateDots() {
        const dotsContainer = document.getElementById('carouselDots');
        if (!dotsContainer) return;

        const totalPages = Math.ceil(this.videosData.length / this.cardsPerView);
        dotsContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => 
            `<div class="carousel-dot ${i === this.currentIndex ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');
    }

    updateButtons() {
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        
        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        if (nextBtn) {
            const totalPages = Math.ceil(this.videosData.length / this.cardsPerView);
            nextBtn.disabled = this.currentIndex >= totalPages - 1;
        }
    }

    moveCarousel(direction) {
        const totalPages = Math.ceil(this.videosData.length / this.cardsPerView);
        
        if (this.playingVideoId !== null) {
            this.stopVideoInline(this.playingVideoId);
        }
        
        if (direction === 'next' && this.currentIndex < totalPages - 1) {
            this.currentIndex++;
        } else if (direction === 'prev' && this.currentIndex > 0) {
            this.currentIndex--;
        }

        this.updateCarouselPosition();
        this.updateDots();
        this.updateButtons();
    }

    goToSlide(index) {
        if (this.playingVideoId !== null) {
            this.stopVideoInline(this.playingVideoId);
        }
        
        this.currentIndex = index;
        this.updateCarouselPosition();
        this.updateDots();
        this.updateButtons();
    }

    updateCarouselPosition(smooth = true) {
        const track = document.getElementById('videosCarouselTrack');
        if (!track) return;

        if (!smooth) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }

        const cardWidth = track.querySelector('.video-card')?.offsetWidth || 0;
        const offset = -(this.currentIndex * cardWidth);
        track.style.transform = `translateX(${offset}px)`;
    }

    playVideoInline(videoId) {
        const video = this.videosData.find(v => v.id === videoId);
        if (!video) return;

        if (this.playingVideoId === videoId) {
            return;
        }

        if (this.playingVideoId !== null && this.playingVideoId !== videoId) {
            this.stopVideoInline(this.playingVideoId);
        }

        const contentWrapper = document.getElementById(`video-content-${videoId}`);
        if (!contentWrapper) return;

        const titulo = video.partido || video.title || 'Video de Liga MX';
        const equipo = video.equipo || video.team || 'Liga MX';
        const fecha = video.fecha || video.date || 'Temporada 2025';

        if (video.tipo === 'video' && video.embed_url) {
            contentWrapper.innerHTML = `
                <div class="video-player-wrapper">
                    <div class="video-player-container">
                        <iframe 
                            src="${video.embed_url}?autoplay=1&rel=0&modestbranding=1" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen
                            class="video-iframe">
                        </iframe>
                    </div>
                    <button class="video-close-btn" onclick="videosCarouselInstance.stopVideoInline(${videoId})">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                    <div class="video-info playing">
                        <h3 class="video-title">${titulo}</h3>
                        <div class="video-meta">
                            <span class="video-equipo">
                                <i class="fas fa-shield-alt"></i>
                                ${equipo}
                            </span>
                            <span class="video-fecha">${fecha}</span>
                        </div>
                    </div>
                </div>
            `;
            this.playingVideoId = videoId;
            console.log('▶️ Reproduciendo video:', titulo);
        } else {
            window.open(video.link, '_blank');
        }
    }

    stopVideoInline(videoId) {
        const video = this.videosData.find(v => v.id === videoId);
        if (!video) return;

        const contentWrapper = document.getElementById(`video-content-${videoId}`);
        if (!contentWrapper) return;

        const titulo = video.partido || video.title || 'Video de Liga MX';
        const equipo = video.equipo || video.team || 'Liga MX';
        const fecha = video.fecha || video.date || 'Temporada 2025';
        const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${this.extractVideoId(video.link)}/maxresdefault.jpg`;

        contentWrapper.innerHTML = `
            <div class="video-thumbnail-wrapper">
                <img src="${thumbnail}" 
                     alt="${titulo}" 
                     class="video-thumbnail" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/800x450/1a1f3a/ffffff?text=Liga+MX'">
                <div class="video-play-overlay">
                    <i class="fas fa-play"></i>
                </div>
                <span class="video-tipo-badge">${video.tipo === 'video' ? 'YouTube' : 'Externo'}</span>
            </div>
            <div class="video-info">
                <h3 class="video-title">${titulo}</h3>
                <div class="video-meta">
                    <span class="video-equipo">
                        <i class="fas fa-shield-alt"></i>
                        ${equipo}
                    </span>
                    <span class="video-fecha">${fecha}</span>
                </div>
            </div>
        `;

        this.playingVideoId = null;
        console.log('⏸️ Video cerrado');
    }

    setupEventListeners() {
        const dotsContainer = document.getElementById('carouselDots');
        const track = document.getElementById('videosCarouselTrack');

        if (dotsContainer) {
            dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('carousel-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    this.goToSlide(index);
                }
            });
        }

        if (track) {
            track.addEventListener('click', (e) => {
                if (!this.isDragging) {
                    const closeBtn = e.target.closest('.video-close-btn');
                    if (closeBtn) {
                        return;
                    }
                    
                    const card = e.target.closest('.video-card');
                    if (card) {
                        const videoId = parseInt(card.dataset.videoId);
                        this.playVideoInline(videoId);
                    }
                }
            });

            track.addEventListener('mousedown', (e) => this.handleDragStart(e));
            track.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: true });
            
            document.addEventListener('mousemove', (e) => this.handleDragMove(e));
            document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
            
            document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
            document.addEventListener('touchend', (e) => this.handleDragEnd(e));
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.playingVideoId !== null) {
                this.stopVideoInline(this.playingVideoId);
            }
            if (e.key === 'ArrowLeft') this.moveCarousel('prev');
            if (e.key === 'ArrowRight') this.moveCarousel('next');
        });
    }

    handleDragStart(e) {
        if (e.target.closest('.video-close-btn') || e.target.closest('.video-iframe')) {
            return;
        }
        
        this.isDragging = true;
        this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        this.currentX = this.startX;
    }

    handleDragMove(e) {
        if (!this.isDragging) return;

        this.currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const diff = this.currentX - this.startX;
        
        if (Math.abs(diff) > 5) {
            e.preventDefault();
        }
    }

    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const diff = this.currentX - this.startX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.moveCarousel('prev');
            } else {
                this.moveCarousel('next');
            }
        } else {
            this.updateCarouselPosition();
        }

        this.startX = 0;
        this.currentX = 0;
    }
}

let videosCarouselInstance;

document.addEventListener('DOMContentLoaded', () => {
    videosCarouselInstance = new VideosCarousel();
});
