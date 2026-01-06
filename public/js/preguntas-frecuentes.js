document.addEventListener("DOMContentLoaded", () => {

    const items = document.querySelectorAll(".faq-item");

    /* -------------------------------
       AUTOCIERRE DEL ACORDEÓN
    ------------------------------- */
    items.forEach(item => {
        const pregunta = item.querySelector(".faq-question");

        pregunta.addEventListener("click", () => {

            // Cerrar los demás
            items.forEach(i => {
                if (i !== item) i.classList.remove("active");
            });

            // Abrir/cerrar el clickeado
            item.classList.toggle("active");

            // Auto-scroll suave
            if (item.classList.contains("active")) {
                setTimeout(() => {
                    item.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }, 250);
            }
        });
    });

});
