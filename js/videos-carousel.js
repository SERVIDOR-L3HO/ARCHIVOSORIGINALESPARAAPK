class VideosCarousel {
    constructor() {
        this.currentIndex = 0;
        this.videosData = [];
        this.cardsPerView = 3;
        this.init();
    }

    async init() {
        await this.loadVideos();
        this.updateCardsPerView();
        this.render();
        this.setupEventListeners();
        window.addEventListener('resize', () => this.updateCardsPerView());
    }

    async loadVideos() {
        try {
            console.log('📺 Cargando videos desde UltraGol API...');
            
            if (window.ULTRAGOL_API) {
                this.videosData = await window.ULTRAGOL_API.getVideos();
                
                if (this.videosData && this.videosData.length > 0) {
                    console.log('✅ Videos de Liga MX cargados desde API:', this.videosData.length);
                    return;
                }
            }
            
            console.log('⚠️ API no disponible, usando JSON local como fallback...');
            const response = await fetch('/api/videos');
            this.videosData = await response.json();
            console.log('✅ Videos de Liga MX cargados desde JSON:', this.videosData.length);
        } catch (error) {
            console.error('❌ Error al cargar videos:', error);
            this.videosData = [];
        }
    }

    updateCardsPerView() {
        const width = window.innerWidth;
        if (width < 768) {
            this.cardsPerView = 1;
        } else if (width < 1200) {
            this.cardsPerView = 2;
        } else {
            this.cardsPerView = 3;
        }
    }

    render() {
        const track = document.getElementById('videosCarouselTrack');
        if (!track || this.videosData.length === 0) return;

        track.innerHTML = this.videosData.map(video => `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail-wrapper">
                    <img src="${video.thumbnail}" alt="${video.partido}" class="video-thumbnail" loading="lazy">
                    <div class="video-play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <span class="video-tipo-badge">${video.tipo === 'video' ? 'YouTube' : 'Externo'}</span>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.partido}</h3>
                    <div class="video-meta">
                        <span class="video-equipo">
                            <i class="fas fa-shield-alt"></i>
                            ${video.equipo}
                        </span>
                        <span class="video-fecha">${video.fecha}</span>
                    </div>
                </div>
            </div>
        `).join('');

        this.updateDots();
        this.updateButtons();
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
        this.currentIndex = index;
        this.updateCarouselPosition();
        this.updateDots();
        this.updateButtons();
    }

    updateCarouselPosition() {
        const track = document.getElementById('videosCarouselTrack');
        if (!track) return;

        const cardWidth = track.querySelector('.video-card')?.offsetWidth || 0;
        const gap = 30;
        const offset = -(this.currentIndex * this.cardsPerView * (cardWidth + gap));
        track.style.transform = `translateX(${offset}px)`;
    }

    openVideoModal(videoId) {
        const video = this.videosData.find(v => v.id === videoId);
        if (!video) return;

        const modal = document.getElementById('videoModal');
        const modalTitle = document.getElementById('videoModalTitle');
        const modalDescription = document.getElementById('videoModalDescription');
        const modalPlayer = document.getElementById('videoModalPlayer');

        if (modal && modalTitle && modalDescription && modalPlayer) {
            modalTitle.textContent = video.partido;
            modalDescription.textContent = video.descripcion;

            if (video.tipo === 'video' && video.embed_url) {
                modalPlayer.innerHTML = `
                    <iframe 
                        src="${video.embed_url}?autoplay=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                modalPlayer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #1a1f3a; color: white;">
                        <div style="text-align: center;">
                            <i class="fas fa-external-link-alt" style="font-size: 3rem; margin-bottom: 20px; color: #ff6b35;"></i>
                            <p style="margin-bottom: 20px;">Este video está disponible en una plataforma externa</p>
                            <a href="${video.link}" target="_blank" class="hero-btn hero-btn-primary" style="display: inline-block;">
                                Ver Video <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `;
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const modalPlayer = document.getElementById('videoModalPlayer');

        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (modalPlayer) {
            modalPlayer.innerHTML = '';
        }
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        const dotsContainer = document.getElementById('carouselDots');
        const track = document.getElementById('videosCarouselTrack');
        const modalClose = document.getElementById('videoModalClose');
        const modal = document.getElementById('videoModal');

        if (prevBtn) prevBtn.addEventListener('click', () => this.moveCarousel('prev'));
        if (nextBtn) nextBtn.addEventListener('click', () => this.moveCarousel('next'));

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
                const card = e.target.closest('.video-card');
                if (card) {
                    const videoId = parseInt(card.dataset.videoId);
                    this.openVideoModal(videoId);
                }
            });
        }

        if (modalClose) modalClose.addEventListener('click', () => this.closeVideoModal());
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeVideoModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeVideoModal();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VideosCarousel();
});
