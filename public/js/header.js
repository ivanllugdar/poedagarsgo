/* ------------------------------------------------------
   CONFIGURACIÓN
------------------------------------------------------ */

// Header al mismo nivel que las páginas (public/)
const headerPath = "../header.html";

/* ------------------------------------------------------
   CARGA DEL HEADER
------------------------------------------------------ */
function loadHeader() {
  console.log("🔄 Cargando header desde:", headerPath);

  // 🔥 anti-cache para Live Server
  fetch(`${headerPath}?v=${Date.now()}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const headerContainer = document.getElementById("header-container");
      if (!headerContainer) {
        console.error("❌ No existe #header-container");
        return;
      }

      headerContainer.innerHTML = html;

      const headerEl = headerContainer.querySelector("header.header");
      if (!headerEl) {
        console.error("❌ header.html no contiene <header class='header'>");
        return;
      }

      /* ------------------------------------------
         🔧 CREAR OVERLAY SI NO EXISTE
      ------------------------------------------ */
      let overlay = headerEl.querySelector("#menu-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "menu-overlay";
        overlay.className = "menu-overlay";
        headerEl.appendChild(overlay);
        console.warn("🛠️ #menu-overlay no venía en header.html → creado automáticamente");
      }

      requestAnimationFrame(() => initHeaderFunctions(headerEl));
    })
    .catch((err) => {
      console.error("❌ Error cargando header:", err);
      renderFallbackHeader();
    });
}

/* ------------------------------------------------------
   FALLBACK HEADER
------------------------------------------------------ */
function renderFallbackHeader() {
  const c = document.getElementById("header-container");
  if (!c) return;

  c.innerHTML = `
    <header class="header" style="background:#02211a;padding:16px;text-align:center">
      <a href="index.html" style="color:#fff;text-decoration:none;font-weight:600">
        POEDAGAR SGO
      </a>
    </header>
  `;
}

/* ------------------------------------------------------
   INIT HEADER (SCOPED)
------------------------------------------------------ */
function initHeaderFunctions(headerEl) {
  initActiveLink(headerEl);
  initMobileMenu(headerEl);
  initSearchButton(headerEl);
  adjustBodyPadding(headerEl);

  window.addEventListener("resize", () => adjustBodyPadding(headerEl));
}

/* ------------------------------------------------------
   LINK ACTIVO
------------------------------------------------------ */
function initActiveLink(headerEl) {
  const current =
    window.location.pathname.split("/").pop() || "index.html";

  headerEl.querySelectorAll(".menu-links a").forEach((a) => {
    const page = (a.getAttribute("href") || "").split("/").pop();
    if (page === current) a.classList.add("activo");
  });
}

/* ------------------------------------------------------
   MENÚ MOBILE (BLINDADO)
------------------------------------------------------ */
function initMobileMenu(headerEl) {
  const menuToggle = headerEl.querySelector("#menu-toggle");
  const mainMenu = headerEl.querySelector("#main-menu");
  const menuOverlay = headerEl.querySelector("#menu-overlay");

  const status = {
    menuToggle: !!menuToggle,
    mainMenu: !!mainMenu,
    menuOverlay: !!menuOverlay,
  };

  if (!menuToggle || !mainMenu || !menuOverlay) {
    console.warn("⚠️ Menú móvil incompleto", status);
    document.body.style.overflow = "";
    return;
  }

  // Evitar listeners duplicados
  if (menuToggle.dataset.bound === "1") return;
  menuToggle.dataset.bound = "1";

  const closeMenu = () => {
    menuToggle.classList.remove("active");
    mainMenu.classList.remove("open");
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const opened = mainMenu.classList.toggle("open");
    menuToggle.classList.toggle("active");
    menuOverlay.classList.toggle("active");
    document.body.style.overflow = opened ? "hidden" : "";
  });

  menuOverlay.addEventListener("click", closeMenu);

  headerEl.querySelectorAll(".menu-links a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  mainMenu.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainMenu.classList.contains("open")) {
      closeMenu();
    }
  });
}

/* ------------------------------------------------------
   BOTÓN BUSCAR
------------------------------------------------------ */
function initSearchButton(headerEl) {
  const searchBtn = headerEl.querySelector("#search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      window.location.href = "tienda.html?search=true";
    });
  }
}

/* ------------------------------------------------------
   PADDING BODY
------------------------------------------------------ */
function adjustBodyPadding(headerEl) {
  if (!headerEl) return;
  document.body.style.paddingTop = `${headerEl.offsetHeight}px`;
}

/* ------------------------------------------------------
   INIT GLOBAL
------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", loadHeader);
