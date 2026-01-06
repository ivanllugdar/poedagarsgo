document.addEventListener("DOMContentLoaded", () => {
    fetch("/footer.html")
        .then(response => response.text())
        .then(html => {
            const contenedor = document.getElementById("footer-container");
            if (contenedor) {
                contenedor.innerHTML = html;
            }
        })
        .catch(err => {
            console.error("Error cargando el footer:", err);
        });
});
