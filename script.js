// scripts for SPA behavior and data loading

let dataCache = null;

function loadJSON() {
    return fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            dataCache = data;
            populateHeader(data);
                populateProfileExtras(data);
                populateAboutAndGallery(data);
                showSection('historia');
        })
        .catch(err => {
            document.getElementById('content').innerText = 'Error loading data';
            console.error(err);
        });
}

function populateHeader(data) {
    document.getElementById('name').innerText = data.nombre;
    document.getElementById('career').innerText = data.carrera;
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
    if (aboutText && data.about) aboutText.innerText = data.about;
    if (aboutPic && data.profile_pic) aboutPic.src = data.profile_pic;
    if (gallery && Array.isArray(data.gallery)) {
        // ahora usamos un carrusel
        populateCarousel(data.gallery);
    }
}

// Carousel implementation
let carouselIndex = 0;
let carouselTimer = null;

function populateCarousel(images) {
    const track = document.getElementById('carousel-track');
    const dots = document.getElementById('carousel-dots');
    if (!track || !dots) return;
    track.innerHTML = '';
    dots.innerHTML = '';
    images.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Fotografía ${i+1}`;
        slide.appendChild(img);
        track.appendChild(slide);

        const dot = document.createElement('button');
        dot.addEventListener('click', () => { goToSlide(i); resetCarouselTimer(); });
        dots.appendChild(dot);
    });

    // attach controls
    const prev = document.getElementById('carousel-prev');
    const next = document.getElementById('carousel-next');
    prev && (prev.onclick = () => { prevSlide(); resetCarouselTimer(); });
    next && (next.onclick = () => { nextSlide(); resetCarouselTimer(); });

    updateCarousel();
    startCarouselTimer();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const dots = Array.from(document.querySelectorAll('.carousel-dots button'));
    if (!track) return;
    const slideWidth = track.clientWidth;
    track.style.transform = `translateX(-${carouselIndex * slideWidth}px)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === carouselIndex));
}

function prevSlide() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const slides = track.children.length;
    carouselIndex = (carouselIndex - 1 + slides) % slides;
    updateCarousel();
}

function nextSlide() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const slides = track.children.length;
    carouselIndex = (carouselIndex + 1) % slides;
    updateCarousel();
}

function goToSlide(i) {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const slides = track.children.length;
    carouselIndex = Math.max(0, Math.min(i, slides - 1));
    updateCarousel();
}

function startCarouselTimer() {
    stopCarouselTimer();
    carouselTimer = setInterval(() => { nextSlide(); }, 4500);
}

function stopCarouselTimer() { if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; } }

function resetCarouselTimer() { stopCarouselTimer(); startCarouselTimer(); }

// ensure carousel recalculates on resize
window.addEventListener('resize', () => { updateCarousel(); });

function showSection(section) {
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

    if (Array.isArray(sectionData.items)) {
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

    // update active link
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.section === section);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadJSON();
    document.querySelectorAll('nav a').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            showSection(a.dataset.section);
        });
    });
});