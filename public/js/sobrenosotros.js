/* ------------------------------------------------------
   ANIMACIONES SCROLL PARA SECCIÓN SOBRE NOSOTROS
------------------------------------------------------ */
function initSobrenosotrosAnimations() {
    const bloques = document.querySelectorAll(
        '.sobrenosotros-bloque, .sobrenosotros-bloque-centrado'
    );

    if (!bloques.length) {
        console.warn("⚠️ No se encontraron bloques para animar en Sobre Nosotros");
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    bloques.forEach(bloque => observer.observe(bloque));

    console.log("🎭 Animaciones de Sobre Nosotros iniciadas correctamente");
}

/* ------------------------------------------------------
   INICIALIZACIÓN ÚNICA — SIN REPETICIONES
------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    initSobrenosotrosAnimations();
});

/* 
   Si el header se carga dinámicamente y se reestructura el DOM,
   podés volver a llamar esta función, pero SOLAMENTE desde fuera,
   nunca aquí dentro. 
*/
