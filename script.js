// scripts for SPA behavior and data loading

let dataCache = null;

async function loadJSON() {
    const paths = ['data.json', 'data.proposal.json'];
    const loader = window.fetchJSON ? window.fetchJSON : (path => fetch(path).then(r => { if(!r.ok) throw new Error('Network response was not ok'); return r.json(); }));

    for (const p of paths) {
        try {
            const data = await loader(p);
            if (!data) throw new Error('no data');
            dataCache = data;
            populateHeader(data);
            populateProfileExtras(data);
            populateAboutAndGallery(data);
            populateProjects(data);
            populateSkills(data);
            return;
        } catch (err) {
            // try next
            console.warn('Failed loading', p, err && err.message);
        }
    }

    const contentEl = document.getElementById('content') || document.body;
    if (contentEl) contentEl.innerText = 'Error loading data';
    console.error('All data load attempts failed');
}

function populateHeader(data) {
    const nameEl = document.getElementById('name');
    const careerEl = document.getElementById('career');
    if(nameEl) nameEl.innerText = data.nombre || '';
    if(careerEl) careerEl.innerText = data.titulo || data.carrera || '';
    document.getElementById('year').innerText = new Date().getFullYear();
}

function populateProfileExtras(data) {
    const bio = document.getElementById('bio');
    const pic = document.getElementById('profile-pic');
    const badges = document.getElementById('badges');
    if (bio && data.bio) bio.innerText = data.bio;
    if (pic && data.profile_pic) pic.src = data.profile_pic;
    if (badges && Array.isArray(data.badges)) {
        badges.innerHTML = '';
        data.badges.forEach(b => {
            const span = document.createElement('span');
            span.className = 'badge';
            span.innerText = b;
            badges.appendChild(span);
        });
    }
}

function populateAboutAndGallery(data) {
    const aboutText = document.getElementById('about-text');
    const aboutPic = document.getElementById('about-pic');
    const gallery = document.getElementById('gallery');
    if (aboutText && data.about) {
        aboutText.innerText = (typeof data.about === 'string') ? data.about : (data.about.texto || '');
    }
    if (aboutPic && data.profile_pic) aboutPic.src = data.profile_pic;
    if (gallery && Array.isArray(data.gallery)) {
        // ahora usamos un carrusel
        populateCarousel(data.gallery);
    }
}

function populateProjects(data){
    const projectsEl = document.getElementById('projects');
    if(!projectsEl) return;
    if(Array.isArray(data.projects)){
        projectsEl.innerHTML = data.projects.map(p => `\n      <article class="project-card" data-category="${p.tipo || ''}">\n        <a class="project-link-wrap" href="${p.demo || '#'}">\n          <img class="thumb" loading="lazy" src="${p.thumbnail || ''}" alt="${p.nombre || ''}">\n          <div class="content">\n            <h3>${p.nombre || ''}</h3>\n            <p class="project-desc">${p.descripcion || ''}</p>\n            <div class="project-meta">${p.anio || ''} • ${p.rol || ''}</div>\n          </div>\n        </a>\n        <div class="project-actions"><a class="project-link" href="${p.demo || '#'}">Ver demo</a></div>\n      </article>`).join('\n');
    } else if(data.proyectos && Array.isArray(data.proyectos.items)){
        // legacy support
        projectsEl.innerHTML = data.proyectos.items.join('\n');
    }
}

// Populate skills section
function populateSkills(data){
    const skillsEl = document.getElementById('skills-list');
    if(!skillsEl) return;
    skillsEl.innerHTML = '';
    if(Array.isArray(data.skills)){
        data.skills.forEach(cat => {
            const wrap = document.createElement('div');
            wrap.className = 'skill-category';
            const h = document.createElement('h4');
            h.innerText = cat.categoria || '';
            wrap.appendChild(h);
            const ul = document.createElement('ul');
            (cat.items || []).forEach(it => {
                const li = document.createElement('li');
                li.innerText = it;
                ul.appendChild(li);
            });
            wrap.appendChild(ul);
            skillsEl.appendChild(wrap);
        });
    }
}

// Populate gallery
function populateGallery(data){
    const galleryEl = document.getElementById('gallery-track') || document.getElementById('gallery');
    if(!galleryEl) return;
    galleryEl.innerHTML = '';
    if(Array.isArray(data.gallery)){
        data.gallery.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.style.width = '180px';
            img.style.marginRight = '8px';
            galleryEl.appendChild(img);
        });
    }
}

// Populate contact info and socials
function populateContact(data){
    const contactEl = document.getElementById('contact-info');
    if(!contactEl) return;
    contactEl.innerHTML = '';
    if(data.contact){
        const c = data.contact;
        if(c.email) contactEl.appendChild(document.createElement('div')).innerText = `Email: ${c.email}`;
        if(c.telefono) contactEl.appendChild(document.createElement('div')).innerText = `Teléfono: ${c.telefono}`;
        if(c.ubicacion) contactEl.appendChild(document.createElement('div')).innerText = `Ubicación: ${c.ubicacion}`;
    }
    if(Array.isArray(data.socials)){
        const soc = document.createElement('div');
        soc.className = 'socials';
        data.socials.forEach(s => {
            const a = document.createElement('a');
            a.href = s.url || '#';
            a.target = '_blank';
            a.rel = 'noopener';
            a.innerText = s.name || s.url;
            a.style.marginRight = '8px';
            soc.appendChild(a);
        });
        contactEl.appendChild(soc);
    }
}

// After loading data, call remaining populators
const _origLoadJSON = loadJSON;
loadJSON = function(){
    return _origLoadJSON().then(() => {
        if(!dataCache) return;
        try{ populateSkills(dataCache); }catch(e){}
        try{ populateGallery(dataCache); }catch(e){}
        try{ populateContact(dataCache); }catch(e){}
    });
};

// Carousel implementation (generic support for multiple carousels)
const carousels = {}; // stores state per prefix { index, timer }

/**
 * Initialize a carousel using a given id prefix (e.g. 'carousel' or 'portfolio').
 * Elements expected:         
 *   #{prefix}-track   (container for slides)
 *   #{prefix}-dots    (dot buttons container)
 *   #{prefix}-prev    (previous control)
 *   #{prefix}-next    (next control)
 */
function initCarousel(prefix, images) {
    const entry = { index: 0, timer: null };
    carousels[prefix] = entry;

    const track = document.getElementById(`${prefix}-track`);
    const dots = document.getElementById(`${prefix}-dots`);
    if (!track || !dots) return;

    track.innerHTML = '';
    dots.innerHTML = '';

    images.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Fotografía ${i + 1}`;
        slide.appendChild(img);
        track.appendChild(slide);

        const dot = document.createElement('button');
        dot.addEventListener('click', () => { goToCarousel(prefix, i); resetCarouselTimer(prefix); });
        dots.appendChild(dot);
    });

    const prev = document.getElementById(`${prefix}-prev`);
    const next = document.getElementById(`${prefix}-next`);
    prev && (prev.onclick = () => { prevCarousel(prefix); resetCarouselTimer(prefix); });
    next && (next.onclick = () => { nextCarousel(prefix); resetCarouselTimer(prefix); });

    updateCarousel(prefix);
    startCarouselTimer(prefix);
}

// convenience wrapper used by existing code
function populateCarousel(images) {
    initCarousel('carousel', images);
}

function updateCarousel(prefix) {
    const entry = carousels[prefix];
    if (!entry) return;
    const track = document.getElementById(`${prefix}-track`);
    const dots = Array.from(document.querySelectorAll(`#${prefix}-dots button`));
    if (!track) return;
    const slideWidth = track.clientWidth;
    track.style.transform = `translateX(-${entry.index * slideWidth}px)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === entry.index));
}

function prevCarousel(prefix) {
    const track = document.getElementById(`${prefix}-track`);
    if (!track) return;
    const slides = track.children.length;
    const entry = carousels[prefix];
    entry.index = (entry.index - 1 + slides) % slides;
    updateCarousel(prefix);
}

function nextCarousel(prefix) {
    const track = document.getElementById(`${prefix}-track`);
    if (!track) return;
    const slides = track.children.length;
    const entry = carousels[prefix];
    entry.index = (entry.index + 1) % slides;
    updateCarousel(prefix);
}

function goToCarousel(prefix, i) {
    const track = document.getElementById(`${prefix}-track`);
    if (!track) return;
    const slides = track.children.length;
    const entry = carousels[prefix];
    entry.index = Math.max(0, Math.min(i, slides - 1));
    updateCarousel(prefix);
}

function startCarouselTimer(prefix) {
    stopCarouselTimer(prefix);
    const entry = carousels[prefix];
    entry.timer = setInterval(() => { nextCarousel(prefix); }, 4500);
}

function stopCarouselTimer(prefix) {
    const entry = carousels[prefix];
    if (entry && entry.timer) {
        clearInterval(entry.timer);
        entry.timer = null;
    }
}

function resetCarouselTimer(prefix) {
    stopCarouselTimer(prefix);
    startCarouselTimer(prefix);
}

// ensure all carousels recalc on resize
window.addEventListener('resize', () => {
    Object.keys(carousels).forEach(updateCarousel);
});


// =========================
// Carrusel 3D tipo Mza
// =========================
class MzaCarousel {
    constructor(root, opts = {}) {
        this.root = root;
        this.viewport = root.querySelector('.mzaCarousel-viewport');
        this.track = root.querySelector('.mzaCarousel-track');
        this.slides = Array.from(root.querySelectorAll('.mzaCarousel-slide'));
        this.prevBtn = root.querySelector('.mzaCarousel-prev');
        this.nextBtn = root.querySelector('.mzaCarousel-next');
        this.pagination = root.querySelector('.mzaCarousel-pagination');
        this.progressBar = root.querySelector('.mzaCarousel-progressBar');
        this.isFF = typeof InstallTrigger !== 'undefined';
        this.n = this.slides.length;
        this.state = {
            index: 0,
            pos: 0,
            width: 0,
            height: 0,
            gap: 28,
            dragging: false,
            pointerId: null,
            x0: 0,
            v: 0,
            t0: 0,
            animating: false,
            hovering: false,
            startTime: 0,
            pausedAt: 0,
            rafId: 0
        };
        this.opts = Object.assign({
            gap: 28,
            peek: 0.15,
            rotateY: 34,
            zDepth: 150,
            scaleDrop: 0.09,
            blurMax: 2.0,
            activeLeftBias: 0.12,
            interval: 4500,
            transitionMs: 900,
            keyboard: true,
            breakpoints: [
                { mq: '(max-width: 1200px)', gap: 24, peek: 0.12, rotateY: 28, zDepth: 120, scaleDrop: 0.08, activeLeftBias: 0.1 },
                { mq: '(max-width: 1000px)', gap: 18, peek: 0.09, rotateY: 22, zDepth: 90, scaleDrop: 0.07, activeLeftBias: 0.09 },
                { mq: '(max-width: 768px)', gap: 14, peek: 0.06, rotateY: 16, zDepth: 70, scaleDrop: 0.06, activeLeftBias: 0.08 },
                { mq: '(max-width: 560px)', gap: 12, peek: 0.05, rotateY: 12, zDepth: 60, scaleDrop: 0.05, activeLeftBias: 0.07 }
            ]
        }, opts);
        if (this.isFF) {
            this.opts.rotateY = 10;
            this.opts.zDepth = 0;
            this.opts.blurMax = 0;
        }
        if (this.n > 0) {
            this._init();
        }
    }
    _init() {
        this._setupDots();
        this._bind();
        this._preloadImages();
        this._measure();
        this.goTo(0, false);
        this._startCycle();
        this._loop();
    }
    _preloadImages() {
        this.slides.forEach((sl) => {
            const card = sl.querySelector('.mzaCard');
            const bg = getComputedStyle(card).getPropertyValue('--mzaCard-bg');
            const m = /url\((?:'|")?([^'")]+)(?:'|")?\)/.exec(bg);
            if (m && m[1]) {
                const img = new Image();
                img.src = m[1];
            }
        });
    }
    _setupDots() {
        this.pagination.innerHTML = '';
        this.dots = this.slides.map((_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'mzaCarousel-dot';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
            b.addEventListener('click', () => {
                this.goTo(i);
            });
            this.pagination.appendChild(b);
            return b;
        });
    }
    _bind() {
        this.prevBtn && this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn && this.nextBtn.addEventListener('click', () => this.next());
        if (this.opts.keyboard) {
            this.root.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });
        }
        const pe = this.viewport;
        pe.addEventListener('pointerdown', (e) => this._onDragStart(e));
        pe.addEventListener('pointermove', (e) => this._onDragMove(e));
        pe.addEventListener('pointerup', (e) => this._onDragEnd(e));
        pe.addEventListener('pointercancel', (e) => this._onDragEnd(e));
        this.root.addEventListener('mouseenter', () => {
            this.state.hovering = true;
            this.state.pausedAt = performance.now();
        });
        this.root.addEventListener('mouseleave', () => {
            if (this.state.pausedAt) {
                this.state.startTime += performance.now() - this.state.pausedAt;
                this.state.pausedAt = 0;
            }
            this.state.hovering = false;
        });
        this.ro = new ResizeObserver(() => this._measure());
        this.ro.observe(this.viewport);
        this.opts.breakpoints.forEach((bp) => {
            const m = window.matchMedia(bp.mq);
            const apply = () => {
                Object.keys(bp).forEach((k) => {
                    if (k !== 'mq') this.opts[k] = bp[k];
                });
                this._measure();
                this._render();
            };
            if (m.addEventListener) m.addEventListener('change', apply);
            else m.addListener(apply);
            if (m.matches) apply();
        });
        this.viewport.addEventListener('pointermove', (e) => this._onTilt(e));
        window.addEventListener('orientationchange', () =>
            setTimeout(() => this._measure(), 250)
        );
    }
    _measure() {
        const viewRect = this.viewport.getBoundingClientRect();
        const pagRect = this.pagination.getBoundingClientRect();
        // espacio reservado para paginación + un pequeño margen inferior
        const bottomGap = 24;
        const pagSpace = pagRect.height + bottomGap;
        // adaptar el alto de la tarjeta al alto aproximado de tus imágenes
        const cardH = 460;
        this.state.width = viewRect.width;
        this.state.height = cardH + pagSpace;
        this.state.gap = this.opts.gap;
        this.slideW = Math.min(880, this.state.width * (1 - this.opts.peek * 2));
        this.root.style.setProperty('--mzaPagH', `${pagSpace}px`);
        this.root.style.setProperty('--mzaCardH', `${cardH}px`);
        // fijar explícitamente la altura total del carrusel para que no sobre espacio
        this.root.style.height = `${cardH + pagSpace}px`;
    }
    _onTilt(e) {
        const r = this.viewport.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width - 0.5;
        const my = (e.clientY - r.top) / r.height - 0.5;
        this.root.style.setProperty('--mzaTiltX', (my * -6).toFixed(3));
        this.root.style.setProperty('--mzaTiltY', (mx * 6).toFixed(3));
    }
    _onDragStart(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        this.state.dragging = true;
        this.state.pointerId = e.pointerId;
        this.viewport.setPointerCapture(e.pointerId);
        this.state.x0 = e.clientX;
        this.state.t0 = performance.now();
        this.state.v = 0;
        this.state.pausedAt = performance.now();
    }
    _onDragMove(e) {
        if (!this.state.dragging || e.pointerId !== this.state.pointerId) return;
        const dx = e.clientX - this.state.x0;
        const dt = Math.max(16, performance.now() - this.state.t0);
        this.state.v = dx / dt;
        const slideSpan = this.slideW + this.state.gap;
        this.state.pos = this._mod(this.state.index - dx / slideSpan, this.n);
        this._render();
    }
    _onDragEnd(e) {
        if (!this.state.dragging || (e && e.pointerId !== this.state.pointerId)) return;
        this.state.dragging = false;
        try {
            if (this.state.pointerId != null) this.viewport.releasePointerCapture(this.state.pointerId);
        } catch (err) {
            // ignore
        }
        this.state.pointerId = null;
        if (this.state.pausedAt) {
            this.state.startTime += performance.now() - this.state.pausedAt;
            this.state.pausedAt = 0;
        }
        const v = this.state.v;
        const threshold = 0.18;
        let target = Math.round(
            this.state.pos - Math.sign(v) * (Math.abs(v) > threshold ? 0.5 : 0)
        );
        this.goTo(this._mod(target, this.n));
    }
    _startCycle() {
        this.state.startTime = performance.now();
        this._renderProgress(0);
    }
    _loop() {
        const step = (t) => {
            if (!this.state.dragging && !this.state.hovering && !this.state.animating) {
                const elapsed = t - this.state.startTime;
                const p = Math.min(1, elapsed / this.opts.interval);
                this._renderProgress(p);
                if (elapsed >= this.opts.interval) this.next();
            }
            this.state.rafId = requestAnimationFrame(step);
        };
        this.state.rafId = requestAnimationFrame(step);
    }
    _renderProgress(p) {
        if (this.progressBar) {
            this.progressBar.style.transform = `scaleX(${p})`;
        }
    }
    prev() {
        this.goTo(this._mod(this.state.index - 1, this.n));
    }
    next() {
        this.goTo(this._mod(this.state.index + 1, this.n));
    }
    goTo(i, animate = true) {
        const start = this.state.pos || this.state.index;
        const end = this._nearest(start, i);
        const dur = animate ? this.opts.transitionMs : 0;
        const t0 = performance.now();
        const ease = (x) => 1 - Math.pow(1 - x, 4);
        this.state.animating = true;
        const step = (now) => {
            const t = Math.min(1, (now - t0) / (dur || 1));
            const p = dur ? ease(t) : 1;
            this.state.pos = start + (end - start) * p;
            this._render();
            if (t < 1) requestAnimationFrame(step);
            else this._afterSnap(i);
        };
        requestAnimationFrame(step);
    }
    _afterSnap(i) {
        this.state.index = this._mod(Math.round(this.state.pos), this.n);
        this.state.pos = this.state.index;
        this.state.animating = false;
        this._render(true);
        this._startCycle();
    }
    _nearest(from, target) {
        let d = target - Math.round(from);
        if (d > this.n / 2) d -= this.n;
        if (d < -this.n / 2) d += this.n;
        return Math.round(from) + d;
    }
    _mod(i, n) {
        return ((i % n) + n) % n;
    }
    _render(markActive = false) {
        const span = this.slideW + this.state.gap;
        const tiltX = parseFloat(this.root.style.getPropertyValue('--mzaTiltX') || 0);
        const tiltY = parseFloat(this.root.style.getPropertyValue('--mzaTiltY') || 0);
        for (let i = 0; i < this.n; i++) {
            let d = i - this.state.pos;
            if (d > this.n / 2) d -= this.n;
            if (d < -this.n / 2) d += this.n;
            const weight = Math.max(0, 1 - Math.abs(d) * 2);
            const biasActive = -this.slideW * this.opts.activeLeftBias * weight;
            const tx = d * span + biasActive;
            const depth = -Math.abs(d) * this.opts.zDepth;
            const rot = -d * this.opts.rotateY;
            const scale = 1 - Math.min(Math.abs(d) * this.opts.scaleDrop, 0.42);
            const blur = Math.min(Math.abs(d) * this.opts.blurMax, this.opts.blurMax);
            const z = Math.round(1000 - Math.abs(d) * 10);
            const s = this.slides[i];
            if (this.isFF) {
                s.style.transform = `translate(${tx}px,-50%) scale(${scale})`;
                s.style.filter = 'none';
            } else {
                s.style.transform = `translate3d(${tx}px,-50%,${depth}px) rotateY(${rot}deg) scale(${scale})`;
                s.style.filter = `blur(${blur}px)`;
            }
            s.style.zIndex = z;
            if (markActive) {
                s.dataset.state = Math.round(this.state.index) === i ? 'active' : 'rest';
            }
            const card = s.querySelector('.mzaCard');
            const parBase = Math.max(-1, Math.min(1, -d));
            const parX = parBase * 48 + tiltY * 2.0;
            const parY = tiltX * -1.5;
            const bgX = parBase * -64 + tiltY * -2.4;
            card.style.setProperty('--mzaParX', `${parX.toFixed(2)}px`);
            card.style.setProperty('--mzaParY', `${parY.toFixed(2)}px`);
            card.style.setProperty('--mzaParBgX', `${bgX.toFixed(2)}px`);
            card.style.setProperty('--mzaParBgY', `${(parY * 0.35).toFixed(2)}px`);
        }
        const active = this._mod(Math.round(this.state.pos), this.n);
        this.dots.forEach((d, i) =>
            d.setAttribute('aria-selected', i === active ? 'true' : 'false')
        );
    }
}


function showSection(section) {
    // sección especial de inicio: solo desplaza a la sección héroe
    if (section === 'inicio') {
        const hero = document.getElementById('hero-section');
        if (hero) {
            hero.scrollIntoView({ behavior: 'smooth' });
        }
        document.querySelectorAll('nav a').forEach(a => {
            a.classList.toggle('active', a.dataset.section === 'inicio');
        });
        return;
    }

    if (!dataCache) return;
    const content = document.getElementById('content');
    content.innerHTML = '';

    const sectionData = dataCache[section];
    if (!sectionData) {
        content.innerText = 'Sección no encontrada';
        return;
    }

    const title = document.createElement('h2');
    title.textContent = sectionData.titulo;
    content.appendChild(title);

    // Special rendering for proyectos: render project cards grid
    if (section === 'proyectos' && Array.isArray(sectionData.items)) {
        const filterBar = document.createElement('div');
        filterBar.className = 'projects-filter';
        const grid = document.createElement('div');
        grid.className = 'projects-grid';

        sectionData.items.forEach(item => {
            const cardWrap = document.createElement('div');
            cardWrap.className = 'project-item';
            cardWrap.innerHTML = item;
            grid.appendChild(cardWrap);
        });

        // construir filtros a partir de los data-category de las tarjetas
        const cards = Array.from(grid.querySelectorAll('.project-card'));
        const categories = new Set();
        cards.forEach(card => {
            const cat = card.dataset.category || 'Otros';
            categories.add(cat);
        });

        // botón "Todos"
        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'filter-btn active';
        allBtn.dataset.filter = 'Todos';
        allBtn.textContent = 'Todos';
        filterBar.appendChild(allBtn);

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filter-btn';
            btn.dataset.filter = cat;
            btn.textContent = cat;
            filterBar.appendChild(btn);
        });

        const applyFilter = (category) => {
            cards.forEach(card => {
                const cardCat = card.dataset.category || 'Otros';
                const visible = category === 'Todos' || category === cardCat;
                card.parentElement.style.display = visible ? '' : 'none';
            });
        };

        filterBar.addEventListener('click', e => {
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            const cat = btn.dataset.filter;
            filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
            applyFilter(cat);
        });

        content.appendChild(filterBar);
        content.appendChild(grid);
        applyFilter('Todos');
    } else if (Array.isArray(sectionData.items)) {
        const list = document.createElement('ul');
        sectionData.items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            list.appendChild(li);
        });
        content.appendChild(list);
    } else {
        const p = document.createElement('p');
        p.innerText = sectionData.texto || '';
        content.appendChild(p);
    }

    // actualizar icono activo del panel lateral
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.section === section);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadJSON();

    document.querySelectorAll('nav a').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const href = a.getAttribute('href') || '';
            // if it's an in-page anchor (#about, #projects...), do smooth scroll
            if (href.startsWith('#')) {
                const id = href.slice(1);
                const target = document.getElementById(id);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // update active state on nav links
                document.querySelectorAll('nav a').forEach(x => x.classList.toggle('active', x === a));
                return;
            }
            // if it declares a data-section, use SPA renderer
            if (a.dataset && a.dataset.section) {
                showSection(a.dataset.section);
                return;
            }
            // fallback: follow the link
            if (href) window.location.href = href;
        });
    });

    const btnPortfolio = document.getElementById('btn-portfolio');
    if (btnPortfolio) {
        btnPortfolio.addEventListener('click', e => {
            e.preventDefault();
            showSection('proyectos');
            const content = document.getElementById('content');
            if (content) {
                content.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Imágenes reales del portafolio (carpeta ./img dentro de portafolio)
    const portfolioImgs = [
        'img/img 1.jpg',
        'img/img 2.JPG',
        'img/img 3.JPG',
        'img/img 4.jpg'
    ];

    // Carrusel interactivo 3D para la sección "Fotografías"
    const mzaRoot = document.getElementById('mzaCarousel');
    if (mzaRoot) {
        // eslint-disable-next-line no-unused-vars
        const mza = new MzaCarousel(mzaRoot, { transitionMs: 900 });
    }
});