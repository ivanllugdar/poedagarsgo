/* ------------------------------------------------------
   INICIALIZACIÓN ESPECÍFICA DEL INDEX
------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Página de inicio cargada");
    
    // Inicializar funcionalidades específicas del index si las hay
    initHeroVideo();
    initSmoothScrolling();
});

/* ------------------------------------------------------
   CONTROL DEL VIDEO HERO
------------------------------------------------------ */
function initHeroVideo() {
    const heroVideo = document.querySelector('.hero-video');
    if (!heroVideo) return;
    
    // Asegurar que el video se reproduzca correctamente
    heroVideo.addEventListener('loadeddata', () => {
        console.log('🎥 Video del hero cargado correctamente');
    });
    
    // Manejar errores del video
    heroVideo.addEventListener('error', () => {
        console.warn('⚠️ Error cargando el video del hero');
        // Fallback: mostrar imagen de fondo si el video falla
        document.querySelector('.hero').style.backgroundImage = 'url("/assets/img/hero-fallback.jpg")';
    });
}

/* ------------------------------------------------------
   SCROLL SUAVE PARA ENLACES INTERNOS
------------------------------------------------------ */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header.header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ------------------------------------------------------
   ANIMACIONES DE SCROLL PARA EL INDEX
------------------------------------------------------ */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos que queremos animar
    const animatedElements = document.querySelectorAll('.hero-content, .feature-card, .section-title');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Exportar funciones para uso externo si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initHeroVideo, initSmoothScrolling, initScrollAnimations };
}