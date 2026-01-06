/* -------------------------------------
   ANIMACIONES DE SCROLL (VERSION FINAL)
-------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    // Elementos que deben animarse al entrar en vista
    const elementosAnimados = document.querySelectorAll(
        ".benefit-card, .mayoristas-vision, .img-item, .beneficios-extra, .final-bloque"
    );

    function mostrarElementos() {
        const trigger = window.innerHeight * 0.85;

        elementosAnimados.forEach(el => {
            const top = el.getBoundingClientRect().top;

            if (top < trigger) {
                el.classList.add("visible");
            }
        });
    }

    // Ejecutar al cargar y al hacer scroll
    window.addEventListener("scroll", mostrarElementos);
    mostrarElementos();

});
