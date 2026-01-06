document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form-contacto");
    const estado = document.getElementById("estado-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        estado.textContent = "Enviando...";
        estado.style.color = "#e6c862";

        const data = new FormData(form);

        try {
            const resp = await fetch(form.action, {
                method: "POST",
                body: data,
                headers: { "Accept": "application/json" }
            });

            if (resp.ok) {
                estado.textContent = "¡Mensaje enviado correctamente!";
                estado.style.color = "#00ff90";
                form.reset();
            } else {
                estado.textContent = "Hubo un error al enviar el mensaje.";
                estado.style.color = "#ff6b6b";
            }
        }
        catch (error) {
            estado.textContent = "Error de conexión. Intentá de nuevo.";
            estado.style.color = "#ff6b6b";
        }
    });

});
