// Populate the app sections using proyectos/tuenti/data.json
const tituloEl = document.getElementById('titulo');
const subtituloEl = document.getElementById('subtitulo');
const headerPriceEl = document.getElementById('header-price');
const anunciosEl = document.getElementById('app-anuncios');
const cartaEl = document.getElementById('app-carta');
const serviciosEl = document.getElementById('app-servicios');
const menuEl = document.getElementById('app-menu');

// Fallback data in case fetch fails
const fallbackData = {
  "title": "Tuenti",
  "subtitle": "Clon de interfaz móvil",
  "header": {
    "brand": "Tuenti",
    "subtitle": "Clon de interfaz móvil",
    "price": "$15,000"
  },
  "anuncios": [
    {
      "title": "Nuevo combo de datos",
      "description": "Activa combos con más datos en tus apps favoritas."
    },
    {
      "title": "Recarga rápida",
      "description": "Recarga en segundos con tu modo de pago preferido."
    }
  ],
  "carousel": [
    { "image": "anuncio.png", "link": "#app-paquetes" },
    { "image": "anuncio.png", "link": "#app-paquetes" },
    { "image": "anuncio.png", "link": "#app-paquetes" }
  ],
  "plan": {
    "title": "Tu plan",
    "name": "Combo Ejemplo 10 GB",
    "description": "Incluye datos ilimitados en tus apps sin preocuparte",
    "validity": "vigencia: 30 días",
    "price": "$25,000",
    "button": "Recargar plan",
    "usage": [
      {
        "label": "Datos",
        "unit": "GB",
        "used": 3.34,
        "total": 10,
        "subtitle": "Datos móviles"
      },
      {
        "label": "Voz",
        "unit": "min",
        "used": 163,
        "total": 195,
        "subtitle": "Minutos de voz"
      },
      {
        "label": "SMS",
        "unit": "msg",
        "used": 45,
        "total": 100,
        "subtitle": "Mensajes de texto"
      }
    ]
  },
  "servicios": [
    { "label": "Datos", "icon": "📊" },
    { "label": "Recargas", "icon": "💳" },
    { "label": "Paquetes", "icon": "📦" },
    { "label": "Beneficios", "icon": "🎁" },
    { "label": "Soporte", "icon": "🆘" },
    { "label": "Roaming", "icon": "🌍" },
    { "label": "Ajustes", "icon": "⚙️" },
    { "label": "Más", "icon": "⋯" }
  ],
  "menu": [
    { "label": "Inicio", "target": "section-header", "icon": "🏠" },
    { "label": "Cuenta", "target": "app-servicios", "icon": "👤" },
    { "label": "Paquetes", "target": "app-paquetes", "icon": "📦" },
    { "label": "Descuentos", "target": "app-anuncios", "icon": "⭐" },
    { "label": "Más", "target": "app-menu", "icon": "⋯" }
  ]
};

fetch('data.json')
    .then(r => { if (!r.ok) throw new Error('No se pudo cargar data.json'); return r.json(); })
    .then(data => renderApp(data))
    .catch(err => {
        console.error('Usando datos por defecto:', err);
        renderApp(fallbackData);
    });

function renderApp(data) {
    // Header
    if (tituloEl) {
        tituloEl.innerText = escapeHtml(data.header?.brand || data.title);
    }
    if (subtituloEl) {
        subtituloEl.innerText = escapeHtml(data.header?.subtitle || data.subtitle);
    }
    if (headerPriceEl) {
        headerPriceEl.innerText = escapeHtml(data.header?.price || '');
    }

    // Anuncios - Image Carousel
    if (anunciosEl) {
        const carousel = data.carousel || fallbackData.carousel || [];
        const assetsPath = './img/';
        const items = carousel.map(c => {
            const imageSrc = c.image.startsWith('http') || c.image.startsWith('/') ? c.image : assetsPath + c.image;
            return `<div class="carousel-item"><a href="${escapeAttr(c.link)}" title="Ver paquetes"><img src="${escapeAttr(imageSrc)}" alt="anuncio"></a></div>`;
        }).join('');
        const track = anunciosEl.querySelector('#carousel-track');
        if (track) {
            track.innerHTML = items;
        }
        initCarousel(anunciosEl);
    }

    // Carta/Plan
    if (cartaEl) {
        const p = data.plan || {};
        const usageItems = p.usage || [];
        // build each usage container with colored ring based on remaining percentage
        const usageHTML = usageItems.map((u, idx) => {
            const usedPercent = (u.used / u.total) * 100;
            const remainingPercent = 100 - usedPercent;
            let ringColor = '#4caf50';
            if (remainingPercent < 20) ringColor = '#f70059';
            else if (remainingPercent < 50) ringColor = '#ff9800';
            // stroke-dasharray value: circumference * (usedPercent/100)
            const circumference = 2 * Math.PI * 54;
            const dash = (usedPercent / 100) * circumference;
            return `
                <div class="usage-container">
                    <div class="circular-progress">
                        <svg class="progress-ring" viewBox="0 0 120 120">
                            <circle class="progress-ring-bg" cx="60" cy="60" r="54"></circle>
                            <circle class="progress-ring-fill" cx="60" cy="60" r="54" style="stroke-dasharray: ${dash}px; stroke-dashoffset: 0px; stroke:${ringColor}"></circle>
                        </svg>
                        <div class="progress-text">
                            <span class="progress-used">${escapeHtml(u.used)}</span>
                            <span class="progress-unit">${escapeHtml(u.unit)}</span>
                        </div>
                    </div>
                    <div class="usage-info">
                        <h3 class="usage-label">${escapeHtml(u.label)}</h3>
                        <p class="usage-subtitle">${escapeHtml(u.subtitle)}</p>
                        <p class="usage-detail">de ${escapeHtml(u.total)}${escapeHtml(u.unit)}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        // create dots dynamically based on number of usages
        const dotsHTML = usageItems.map((_, i) =>
            `<span class="nav-dot${i===0? ' active' : ''}" data-index="${i}"></span>`
        ).join('');
        
        cartaEl.innerHTML = `
            <div class="plan-section">
                <h3 class="subtitulo balance-box-title">Tu plan</h3>
                <div class="balance-box">
                    <div class="balance-row">
                        <span class="balance-label">Saldo disponible</span>
                        <span class="balance-amount">${escapeHtml(p.saldo || '$0')}</span>
                    </div>
                    <div class="balance-row balance-plan">
                        <span class="balance-plan-name">${escapeHtml(p.planName)}</span>
                        <span class="balance-plan-price">${escapeHtml(p.price)}</span>
                    </div>
                </div>
                
                <div class="plan-info-box">
                    <p class="plan-expiry">${escapeHtml(p.planExpiry)}</p>
                    <p class="plan-includes">${escapeHtml(p.planIncludes)}</p>
                </div>
                
                <div class="usage-carousel">
                    <div class="usage-track">
                        ${usageHTML}
                    </div>
                </div>
                
                <div class="carousel-nav">
                    ${dotsHTML}
                    <span class="nav-dot-large" data-index="current"></span>
                </div>
                
                <div class="detail-link-box">
                    <a href="#" class="detail-link">Ver detalle</a>
                </div>
            </div>
        `;

        // initialize the usage carousel after DOM injection
        const usageContainerDiv = cartaEl.querySelector('.usage-carousel');
        if (usageContainerDiv) {
            initCarousel(usageContainerDiv, '.usage-track');
        }
    }

    // Servicios
    if (serviciosEl) {
        const items = (data.servicios || []).map(s => 
            `<div class="servicio"><div class="servicio-icon">${escapeHtml(s.icon)}</div><div class="servicio-label">${escapeHtml(s.label)}</div></div>`
        ).join('');
        serviciosEl.innerHTML = `<div class="servicios-title">Servicios</div><div class="servicios-grid">${items}</div>`;
    }

    // Menu (internal navigation)
    if (menuEl) {
        menuEl.innerHTML = (data.menu || []).map(m => 
            `<a href="#${escapeAttr(m.target)}" class="menu-item" data-target="${escapeAttr(m.target)}" title="${escapeAttr(m.label)}">${escapeHtml(m.icon)}<span>${escapeHtml(m.label)}</span></a>`
        ).join('');
        menuEl.querySelectorAll('.menu-item').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const t = document.getElementById(a.dataset.target);
                if (t) {
                    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

// Carousel auto-scroll function; accepts custom track selector
function initCarousel(container, trackSelector = '#carousel-track') {
    const track = container.querySelector(trackSelector);
    // assume items are direct children of track
    const items = track ? track.children : [];
    
    if (!track || items.length === 0) return;
    
    let currentIndex = 0;
    const itemCount = items.length;
    
    // find nav dots if any
    const nav = container.querySelector('.carousel-nav');
    const dots = nav ? Array.from(nav.querySelectorAll('.nav-dot')) : [];
    const largeDot = nav ? nav.querySelector('.nav-dot-large') : null;
    
    function updateNav() {
        dots.forEach(d => {
            const idx = parseInt(d.dataset.index, 10);
            d.classList.toggle('active', idx === currentIndex);
        });
        if (largeDot) {
            largeDot.dataset.index = currentIndex;
            // position the larger indicator behind/around the active dot
            const activeDot = dots.find(d => parseInt(d.dataset.index, 10) === currentIndex);
            if (activeDot && nav) {
                const aRect = activeDot.getBoundingClientRect();
                const nRect = nav.getBoundingClientRect();
                const offset = aRect.left - nRect.left + aRect.width/2 - largeDot.offsetWidth/2;
                largeDot.style.transform = `translateX(${offset}px)`;
            }
        }
    }
    
    function slideCarousel(toIndex = null) {
        if (toIndex !== null) {
            currentIndex = toIndex % itemCount;
        } else {
            currentIndex = (currentIndex + 1) % itemCount;
        }
        const itemWidth = items[0].getBoundingClientRect().width;
        const gap = 12; // consistent with CSS gap
        const distance = currentIndex * (itemWidth + gap);
        track.style.transform = `translateX(-${distance}px)`;
        updateNav();
    }
    
    if (dots.length) {
        dots.forEach(d => {
            d.addEventListener('click', e => {
                const idx = parseInt(d.dataset.index, 10);
                slideCarousel(idx);
            });
        });
    }
    
    updateNav();
    setInterval(slideCarousel, 4000);
}

function escapeHtml(str){ return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeAttr(s){ return String(s || '').replace(/"/g,'&quot;'); }
