document.addEventListener("DOMContentLoaded", () => {
    fetch("/whatsapp.html")
        .then(r => r.text())
        .then(html => {
            const contenedor = document.createElement("div");
            contenedor.innerHTML = html;
            document.body.appendChild(contenedor);
        })
        .catch(err => console.error("Error cargando el botón de WhatsApp:", err));
});
