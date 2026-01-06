// Funcionalidad de filtros, vista y paginación (12 por página)
document.addEventListener('DOMContentLoaded', function () {
  // -----------------------------
  // Elementos principales
  // -----------------------------
  const filtrosPanel = document.querySelector('.filtros-panel');
  const abrirFiltrosBtn = document.getElementById('abrir-filtros');
  const cerrarFiltrosBtn = document.getElementById('cerrar-filtros');

  const viewButtons = document.querySelectorAll('.view-btn');
  const productosContainer = document.getElementById('productos-container');

  const filtroMarca = document.getElementById('filtro-marca');
  const filtroModelo = document.getElementById('filtro-modelo');
  const filtroColor = document.getElementById('filtro-color');
  const filtroPrecio = document.getElementById('filtro-precio');
  const precioMin = document.getElementById('precio-min');
  const precioMax = document.getElementById('precio-max');

  const btnAplicar = document.getElementById('btn-aplicar');
  const btnLimpiar = document.getElementById('btn-limpiar');
  const ordenarPor = document.getElementById('ordenar-por');
  const productosCount = document.getElementById('productos-count');

  if (!productosContainer) return; // sin contenedor, no seguimos

  // Overlay filtros mobile
  const overlay = document.createElement('div');
  overlay.className = 'filtros-overlay';
  document.body.appendChild(overlay);

  // -----------------------------
  // Estado
  // -----------------------------
  const state = {
    view: 'grid',
    itemsPerPage: 12,       // ✅ PAGINACIÓN REAL
    currentPage: 1,
    allProducts: [],
    filteredProducts: []
  };

  const FALLBACK_IMG =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#01140f"/>
            <stop offset="1" stop-color="#000000"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              fill="rgba(255,255,255,0.55)" font-family="Arial" font-size="28">
          Imagen no disponible
        </text>
      </svg>
    `);

  // -----------------------------
  // Helpers
  // -----------------------------
  function normalize(str) {
    return (str || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function formatPriceARS(n) {
    try {
      return `$${Number(n).toLocaleString('es-AR')}`;
    } catch {
      return `$${n}`;
    }
  }

  function isMobile() {
    return window.innerWidth <= 992;
  }

  // -----------------------------
  // Filtros Mobile abrir/cerrar
  // -----------------------------
  function openFilters() {
    if (!filtrosPanel) return;
    filtrosPanel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFilters() {
    if (!filtrosPanel) return;
    filtrosPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (abrirFiltrosBtn) abrirFiltrosBtn.addEventListener('click', openFilters);
  if (cerrarFiltrosBtn) cerrarFiltrosBtn.addEventListener('click', closeFilters);
  overlay.addEventListener('click', closeFilters);

  // -----------------------------
  // Vista grid/list
  // -----------------------------
  function setView(view) {
    state.view = view;

    // botones
    viewButtons.forEach(b => b.classList.remove('active'));
    const activeBtn = Array.from(viewButtons).find(b => b.getAttribute('data-view') === view);
    if (activeBtn) activeBtn.classList.add('active');

    // clases contenedor
    if (view === 'list') {
      productosContainer.classList.add('list-view');
    } else {
      productosContainer.classList.remove('list-view');
    }

    // volver a render (aplica class list-view a cards nuevas)
    renderProducts();
  }

  viewButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const view = this.getAttribute('data-view') || 'grid';
      setView(view);
    });
  });

  // -----------------------------
  // Paginación (se crea si no existe)
  // -----------------------------
  let paginacionEl = document.querySelector('.paginacion');
  let pagPrevBtn, pagNextBtn, pagNumbersEl;

  function ensurePaginationUI() {
    paginacionEl = document.querySelector('.paginacion');
    if (!paginacionEl) {
      paginacionEl = document.createElement('nav');
      paginacionEl.className = 'paginacion';
      paginacionEl.setAttribute('aria-label', 'Paginación');
      paginacionEl.innerHTML = `
        <button type="button" class="pag-btn" data-pag="prev">Anterior</button>
        <div class="pag-numbers" aria-label="Páginas"></div>
        <button type="button" class="pag-btn" data-pag="next">Siguiente</button>
      `;
      productosContainer.insertAdjacentElement('afterend', paginacionEl);
    }

    pagPrevBtn = paginacionEl.querySelector('[data-pag="prev"]');
    pagNextBtn = paginacionEl.querySelector('[data-pag="next"]');
    pagNumbersEl = paginacionEl.querySelector('.pag-numbers');

    if (pagPrevBtn) {
      pagPrevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderProducts();
          renderPagination();
          scrollToCatalogTop();
        }
      });
    }

    if (pagNextBtn) {
      pagNextBtn.addEventListener('click', () => {
        const totalPages = getTotalPages();
        if (state.currentPage < totalPages) {
          state.currentPage++;
          renderProducts();
          renderPagination();
          scrollToCatalogTop();
        }
      });
    }
  }

  function scrollToCatalogTop() {
    // vuelve al inicio del catálogo (sin saltar al hero)
    const anchor = document.querySelector('.catalogo-header') || productosContainer;
    if (anchor && typeof anchor.scrollIntoView === 'function') {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function getTotalPages() {
    const total = state.filteredProducts.length;
    return Math.max(1, Math.ceil(total / state.itemsPerPage));
  }

  function clampPage() {
    const totalPages = getTotalPages();
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;
  }

  function renderPagination() {
    ensurePaginationUI();

    const totalPages = getTotalPages();
    const current = state.currentPage;

    // botones prev/next
    if (pagPrevBtn) pagPrevBtn.disabled = current <= 1;
    if (pagNextBtn) pagNextBtn.disabled = current >= totalPages;

    // números
    if (!pagNumbersEl) return;
    pagNumbersEl.innerHTML = '';

    // lógica de números compacta
    const maxVisible = 7;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    function addPage(n) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pag-number' + (n === current ? ' active' : '');
      btn.textContent = String(n);
      btn.addEventListener('click', () => {
        state.currentPage = n;
        renderProducts();
        renderPagination();
        scrollToCatalogTop();
      });
      pagNumbersEl.appendChild(btn);
    }

    function addDots() {
      const dots = document.createElement('span');
      dots.className = 'pag-dots';
      dots.textContent = '…';
      pagNumbersEl.appendChild(dots);
    }

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) addPage(i);
      return;
    }

    if (start > 1) {
      addPage(1);
      if (start > 2) addDots();
    }

    for (let i = start; i <= end; i++) addPage(i);

    if (end < totalPages) {
      if (end < totalPages - 1) addDots();
      addPage(totalPages);
    }
  }

  // -----------------------------
  // Aplicar filtros + ordenar + render
  // -----------------------------
  function applyFiltersAndRender() {
    const marca = filtroMarca ? filtroMarca.value : 'todas';
    const modelo = normalize(filtroModelo ? filtroModelo.value : '');
    const color = normalize(filtroColor ? filtroColor.value : '');
    const maxPrice = filtroPrecio ? parseInt(filtroPrecio.value || '0', 10) : Infinity;
    const orden = ordenarPor ? ordenarPor.value : 'relevantes';

    // filtrar
    let list = state.allProducts.filter(p => {
      const pMarca = normalize(p.marca);
      const pNombre = normalize(p.nombre);
      const pColor = normalize(p.color);
      const pPrecio = Number(p.precio) || 0;

      if (marca && marca !== 'todas' && normalize(marca) !== pMarca) return false;
      if (modelo && !pNombre.includes(modelo) && !normalize(pMarca).includes(modelo)) return false;
      if (color && !pColor.includes(color)) return false;
      if (Number.isFinite(maxPrice) && pPrecio > maxPrice) return false;

      return true;
    });

    // ordenar
    list = sortProducts(list, orden);

    state.filteredProducts = list;
    state.currentPage = 1; // ✅ cada vez que filtra, vuelve a página 1

    renderProducts();
    renderPagination();
    updateCount();
  }

  function sortProducts(list, orden) {
    const arr = [...list];

    if (orden === 'precio-asc') {
      arr.sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0));
    } else if (orden === 'precio-desc') {
      arr.sort((a, b) => (Number(b.precio) || 0) - (Number(a.precio) || 0));
    } else if (orden === 'nombre') {
      arr.sort((a, b) => normalize(a.nombre).localeCompare(normalize(b.nombre)));
    } else {
      // "relevantes": deja orden natural (o podrías priorizar "nuevo", etc.)
      // arr no se toca
    }

    return arr;
  }

  function updateCount() {
    if (!productosCount) return;

    const total = state.filteredProducts.length;
    const totalPages = getTotalPages();
    const start = (state.currentPage - 1) * state.itemsPerPage + 1;
    const end = Math.min(state.currentPage * state.itemsPerPage, total);

    if (total === 0) {
      productosCount.textContent = 'No hay productos con estos filtros';
    } else {
      productosCount.textContent = `Mostrando ${start}-${end} de ${total} productos (Página ${state.currentPage}/${totalPages})`;
    }
  }

  // -----------------------------
  // Render productos (slice por página)
  // -----------------------------
  function renderProducts() {
    clampPage();

    const total = state.filteredProducts.length;
    const from = (state.currentPage - 1) * state.itemsPerPage;
    const to = from + state.itemsPerPage;
    const pageItems = state.filteredProducts.slice(from, to);

    productosContainer.innerHTML = '';

    // Si no hay resultados
    if (total === 0) {
      const empty = document.createElement('div');
      empty.className = 'sin-productos';
      empty.innerHTML = `
        <h3>Sin resultados</h3>
        <p>Probá cambiar la marca, el color o el rango de precio.</p>
      `;
      productosContainer.appendChild(empty);
      updateCount();
      return;
    }

    pageItems.forEach((producto, i) => {
      const card = document.createElement('article');
      card.className = 'producto-card';
      if (state.view === 'list') card.classList.add('list-view');

      // delay suave
      card.style.animationDelay = `${i * 35}ms`;

      card.setAttribute('data-marca', normalize(producto.marca));
      card.setAttribute('data-color', normalize(producto.color));
      card.setAttribute('data-precio', Number(producto.precio) || 0);

      const badge = producto.badge ? `<div class="producto-badge">${producto.badge}</div>` : '';

      card.innerHTML = `
        <div class="producto-imagen">
          ${badge}
          <img src="${producto.imagen || FALLBACK_IMG}"
               alt="${producto.nombre || 'Producto'}"
               loading="lazy"
               onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
        </div>

        <div class="producto-info">
          <span class="producto-marca">${producto.marca || ''}</span>
          <h3 class="producto-nombre">${producto.nombre || ''}</h3>
          <p class="producto-descripcion">${producto.descripcion || ''}</p>

          <div class="producto-especificaciones">
            <span class="especificacion"><span>🎨</span><span>${producto.color || '-'}</span></span>
            <span class="especificacion"><span>⚙️</span><span>${producto.material || '-'}</span></span>
            <span class="especificacion"><span>🛡️</span><span>${producto.garantia || '-'}</span></span>
          </div>

          <div class="producto-footer">
            <div class="producto-precio">${formatPriceARS(producto.precio)}</div>
            <a href="${producto.url || `/producto/${producto.id || ''}`}" class="btn-ver-detalle">Ver Detalle</a>
          </div>
        </div>
      `;

      productosContainer.appendChild(card);
    });

    updateCount();
  }

  // -----------------------------
  // Control rango de precio (label)
  // -----------------------------
  if (filtroPrecio && precioMax) {
    filtroPrecio.addEventListener('input', function () {
      const value = parseInt(this.value || '0', 10);
      precioMax.textContent = formatPriceARS(value);
    });
  }

  // -----------------------------
  // Eventos aplicar / limpiar / ordenar
  // -----------------------------
  if (btnAplicar) {
    btnAplicar.addEventListener('click', function () {
      applyFiltersAndRender();
      if (isMobile()) closeFilters();
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function () {
      if (filtroMarca) filtroMarca.value = 'todas';
      if (filtroModelo) filtroModelo.value = '';
      if (filtroColor) filtroColor.value = '';
      if (filtroPrecio) filtroPrecio.value = '500000';
      if (precioMax) precioMax.textContent = '$500.000';
      if (ordenarPor) ordenarPor.value = 'relevantes';

      applyFiltersAndRender();
      if (isMobile()) closeFilters();
    });
  }

  if (ordenarPor) ordenarPor.addEventListener('change', applyFiltersAndRender);

  // Opcional: aplicar filtros al tipear (sin apretar botón)
  // (si no querés, borrá estos listeners)
  if (filtroModelo) filtroModelo.addEventListener('input', debounce(applyFiltersAndRender, 200));
  if (filtroColor) filtroColor.addEventListener('input', debounce(applyFiltersAndRender, 200));
  if (filtroMarca) filtroMarca.addEventListener('change', applyFiltersAndRender);
  if (filtroPrecio) filtroPrecio.addEventListener('change', applyFiltersAndRender);

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  // -----------------------------
  // Productos (ejemplo) => ahora cargamos MÁS para probar 12 por página
  // -----------------------------
  function loadSampleProducts() {
    // Si todavía no tenés tu catálogo real, esto te permite ver la paginación funcionando.
    const samples = [];
    const brands = ['Poedagar', 'North Edge'];
    const colors = ['Negro', 'Azul', 'Plateado', 'Dorado', 'Verde'];
    const materials = ['Acero', 'Titanio', 'Acero Inox.', 'Cuero'];
    const imgs = [
      '/assets/img/relojes/poedagar-930.jpg',
      '/assets/img/relojes/north-mars.jpg',
      '/assets/img/relojes/poedagar-777.jpg'
    ];

    let id = 1;
    for (let i = 0; i < 28; i++) { // ✅ 28 productos => varias páginas con 12
      const marca = brands[i % brands.length];
      const color = colors[i % colors.length];
      const material = materials[i % materials.length];
      const precio = 120000 + (i * 8500);

      samples.push({
        id: id++,
        marca,
        nombre: `${marca} Modelo ${900 + i}`,
        descripcion: 'Diseño sobrio, presencia premium y excelente legibilidad. Ideal para uso diario o regalo.',
        precio,
        imagen: imgs[i % imgs.length],
        color,
        material,
        garantia: '90 días',
        badge: i % 5 === 0 ? 'Nuevo' : ''
      });
    }

    state.allProducts = samples;
    state.filteredProducts = [...samples];
  }

  // Si más adelante querés cargar tu catálogo real desde JSON, podés reemplazar esto.
  loadSampleProducts();

  // Inicial
  setView('grid');
  ensurePaginationUI();
  renderProducts();
  renderPagination();
  updateCount();

  // Ajuste si el usuario cambia de tamaño la ventana
  window.addEventListener('resize', () => {
    if (!isMobile()) closeFilters();
  });
});
