document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM cargado, iniciando carga del header...");

    /* ------------------------------------------------------
       DETECTAR SI ESTAMOS EN LIVE SERVER O EN FIREBASE
    ------------------------------------------------------ */
    const isLocal = 
        location.hostname === "127.0.0.1" ||
        location.hostname === "localhost" ||
        location.hostname.includes("192.168.");

    const headerPath = isLocal
        ? "componentes/header.html"
        : "/componentes/header.html";

    console.log("🔄 Cargando header desde:", headerPath);

    /* ------------------------------------------------------
       CARGAR EL HEADER DINÁMICAMENTE
    ------------------------------------------------------ */
    fetch(headerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log("✅ Header cargado correctamente");
            const headerContainer = document.getElementById("header-container");
            
            if (!headerContainer) {
                console.error("❌ No se encontró el contenedor del header");
                return;
            }
            
            headerContainer.innerHTML = html;
            initHeaderFunctions();
        })
        .catch(error => {
            console.error("❌ Error cargando header:", error);
            // Fallback: mostrar header básico si falla la carga
            const headerContainer = document.getElementById("header-container");
            if (headerContainer) {
                headerContainer.innerHTML = `
                    <header class="header" style="background: #02211a; padding: 15px; text-align: center;">
                        <a href="/index.html" style="color: white; text-decoration: none;">
                            <strong>POEDAGAR SGO</strong> - Error cargando navegación
                        </a>
                    </header>
                `;
                adjustBodyPadding();
            }
        });

    /* ------------------------------------------------------
       FUNCIONES DEL HEADER
    ------------------------------------------------------ */
    function initHeaderFunctions() {
        console.log("🔄 Inicializando funciones del header...");

        const header = document.querySelector("header.header");
        if (!header) {
            console.error("❌ No se encontró el elemento header en el DOM");
            return;
        }

        /* --------------------------------------------------
           MARCAR LINK ACTIVO - MEJORADO
        -------------------------------------------------- */
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll(".menu-links a");
        
        console.log("📍 Ruta actual:", currentPath);

        links.forEach(link => {
            const linkPath = link.getAttribute('href');
            // Normalizar rutas para comparación
            const normalizedCurrent = currentPath.endsWith('/') ? currentPath : currentPath + '/';
            const normalizedLink = linkPath.endsWith('/') ? linkPath : linkPath + '/';
            
            // Marcar como activo si coincide la ruta
            if (currentPath === linkPath || 
                normalizedCurrent.includes(normalizedLink) ||
                (currentPath === '/index.html' && linkPath === '/') ||
                (currentPath === '/' && linkPath === '/index.html')) {
                link.classList.add("activo");
                console.log("🎯 Enlace activo detectado:", linkPath);
            }
        });

        /* --------------------------------------------------
           MENÚ HAMBURGUESA (MOBILE)
        -------------------------------------------------- */
        const menuToggle = document.getElementById("menu-toggle");
        const mainMenu = document.getElementById("main-menu");
        const menuOverlay = document.getElementById("menu-overlay");

        if (menuToggle && mainMenu && menuOverlay) {
            console.log("✅ Elementos del menú móvil encontrados");

            menuToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const opened = mainMenu.classList.toggle("open");
                menuToggle.classList.toggle("active");
                menuOverlay.classList.toggle("active");
                document.body.style.overflow = opened ? "hidden" : "";
                console.log("🍔 Menú móvil:", opened ? "abierto" : "cerrado");
            });

            // Cerrar menú al tocar overlay
            menuOverlay.addEventListener("click", () => {
                menuToggle.classList.remove("active");
                mainMenu.classList.remove("open");
                menuOverlay.classList.remove("active");
                document.body.style.overflow = "";
                console.log("🍔 Menú móvil cerrado por overlay");
            });

            // Cerrar menú al tocar enlaces
            document.querySelectorAll(".menu-links a").forEach(link => {
                link.addEventListener("click", () => {
                    menuToggle.classList.remove("active");
                    mainMenu.classList.remove("open");
                    menuOverlay.classList.remove("active");
                    document.body.style.overflow = "";
                    console.log("🍔 Menú móvil cerrado por click en enlace");
                });
            });

            // Prevenir que clicks en el menú lo cierren
            mainMenu.addEventListener("click", (e) => {
                e.stopPropagation();
            });

        } else {
            console.warn("⚠️ No se encontraron todos los elementos del menú móvil");
        }

        /* --------------------------------------------------
           BOTÓN DE BÚSQUEDA - CORREGIDO
        -------------------------------------------------- */
        const searchBtn = document.getElementById("search-btn");
        if (searchBtn) {
            searchBtn.addEventListener("click", () => {
                const searchPath = isLocal 
                    ? "/secciones/tienda/tienda.html?search=true" 
                    : "/secciones/tienda/tienda.html?search=true";
                window.location.href = searchPath;
                console.log("🔍 Redirigiendo a búsqueda:", searchPath);
            });
        } else {
            console.warn("⚠️ Botón de búsqueda no encontrado");
        }

        /* --------------------------------------------------
           AJUSTAR PADDING DEL BODY
        -------------------------------------------------- */
        adjustBodyPadding();

        // Reajustar padding si cambia el tamaño de la ventana
        window.addEventListener('resize', adjustBodyPadding);
    }

    function adjustBodyPadding() {
        const header = document.querySelector("header.header");
        if (header) {
            const headerHeight = header.offsetHeight;
            document.body.style.paddingTop = `${headerHeight}px`;
            console.log("📏 Padding del body ajustado a:", headerHeight + "px");
        } else {
            document.body.style.paddingTop = "80px";
        }
    }

    /* ------------------------------------------------------
       FALLBACK: Si después de 3 segundos no se cargó el header
    ------------------------------------------------------ */
    setTimeout(() => {
        const headerContainer = document.getElementById("header-container");
        if (headerContainer && headerContainer.innerHTML.trim() === '') {
            console.warn("⏰ Timeout: Carga del header muy lenta, aplicando fallback...");
            headerContainer.innerHTML = `
                <header class="header" style="background: #02211a; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
                        <a href="/index.html" style="color: white; text-decoration: none; font-size: 1.2rem;">
                            <strong>POEDAGAR SGO</strong> - Navegación temporal
                        </a>
                    </div>
                </header>
            `;
            adjustBodyPadding();
        }
    }, 3000);
});



/* ------------------------------------------------------
   ANIMACIONES SCROLL PARA SECCIÓN NOSOTROS
------------------------------------------------------ */
function initNosotrosAnimations() {
    const nosotrosSection = document.querySelector('.nosotros-container');
    if (!nosotrosSection) return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observar cada bloque
    const bloques = document.querySelectorAll('.nosotros-bloque');
    bloques.forEach(bloque => {
        observer.observe(bloque);
    });

    console.log('🎭 Animaciones de Nosotros inicializadas');
}

// Llamar la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // ... tu código existente ...

    // Inicializar animaciones de Nosotros
    initNosotrosAnimations();
});

// También ejecutar cuando se cargue el header dinámicamente
function initHeaderFunctions() {
    // ... tu código existente del header ...

    // Reinicializar animaciones después de cargar el header
    setTimeout(initNosotrosAnimations, 100);
}