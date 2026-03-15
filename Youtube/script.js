// Script básico: carga `data.json` y renderiza cards en las secciones
const PREVIEW_MS = 4000; // duración de la previsualización en hover (ms)
async function loadData(){
  try{
    const res = await fetch('data.json');
    const data = await res.json();

    // Render three main sections: Videos Recomendados (6), YouTube Shorts (6), Más videos (6)
    renderCards('videos-1', data.videos.slice(0,6));
    renderCards('shorts-1', data.shorts.slice(0,6));
    // Reuse videos for "Más videos" (if fewer than 12 videos exist)
    renderCards('videos-2', data.videos.slice(0,6));
  }catch(e){
    console.error('Error cargando data.json', e);
  }
}

function renderCards(containerId, items){
  const cont = document.getElementById(containerId);
  if(!cont) return;
  cont.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'card';
    // If the item includes a video, create a video element that plays on hover
    if(it.video){
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      const vid = document.createElement('video');
      vid.src = it.video;
      vid.muted = true;
      vid.loop = true;
      vid.preload = 'metadata';
      if(it.thumbnail) vid.setAttribute('poster', it.thumbnail);
      vid.style.width = '100%';
      vid.style.height = '120px';
      vid.style.objectFit = 'cover';
      vid.style.display = 'block';
      // overlay play icon
      const overlay = document.createElement('div');
      overlay.className = 'play-overlay';
      // No play button: overlay kept only for subtle gradient; clicking opens modal
      // play on hover but limit to PREVIEW_MS milliseconds
      let previewTimeout = null;
      thumb.addEventListener('mouseenter', async () => {
        try{
          await vid.play();
        }catch(e){}
        if(previewTimeout) clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
          try{ vid.pause(); vid.currentTime = 0; }catch(e){}
        }, PREVIEW_MS);
      });
      thumb.addEventListener('mouseleave', () => {
        if(previewTimeout) { clearTimeout(previewTimeout); previewTimeout = null; }
        try{ vid.pause(); vid.currentTime = 0; }catch(e){}
      });
        // click opens modal to view the short (video or image)
      thumb.addEventListener('click', () => {
        const modal = document.getElementById('shortModal');
        const modalVideo = document.getElementById('modalVideo');
        modalVideo.src = it.video || it.thumbnail || '';
        const modalTitle = document.getElementById('modalTitle');
        const modalChannel = document.getElementById('modalChannel');
        if(modalTitle) modalTitle.textContent = it.title || '';
        if(modalChannel) modalChannel.innerHTML = `<img class="channel-logo" src="${it.channelLogo||''}" alt="" style="width:28px;height:28px;border-radius:50%;vertical-align:middle;margin-right:8px"> ${it.channel||''}`;
        modalVideo.currentTime = 0;
        modalVideo.play().catch(()=>{});
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
      });
      thumb.appendChild(vid);
      thumb.appendChild(overlay);

      const meta = document.createElement('div');
      meta.className = 'meta';
      const descHtml = it.description ? `<div class="desc">${it.description}</div>` : '';
      const durHtml = it.duration ? `<div class="duration">${it.duration}</div>` : '';
      meta.innerHTML = `<div class="title">${it.title}</div>${descHtml}<div class="channel"><img class="channel-logo" src="${it.channelLogo || ''}" alt=""/> ${it.channel}</div>`;
      // if duration present, append a duration badge inside thumb
      if(it.duration){
        const durEl = document.createElement('div');
        durEl.className = 'duration';
        durEl.textContent = it.duration;
        thumb.appendChild(durEl);
      }

      card.appendChild(thumb);
      card.appendChild(meta);
    } else {
      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'thumb';
        // ensure thumbnail fallback to canal/short.png
        const thumbUrl = it.thumbnail || 'canal/short.png';
        thumbDiv.style.backgroundImage = `url('${thumbUrl}')`;
      thumbDiv.style.backgroundSize = 'cover';
      thumbDiv.style.backgroundPosition = 'center';

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<div class="title">${it.title}</div><div class="channel"><img class="channel-logo" src="${it.channelLogo || ''}" alt=""/> ${it.channel}</div>`;

      card.appendChild(thumbDiv);
      card.appendChild(meta);
    }
    cont.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', loadData);

// Attach hover/modal handlers to existing DOM thumbs (static cards)
function attachThumbHandlers(){
  const thumbs = document.querySelectorAll('.thumb');
  thumbs.forEach(thumb => {
    if(thumb.dataset.bound) return;
    thumb.dataset.bound = '1';
    const vid = thumb.querySelector('video');
    if(vid){
      let previewTimeout = null;
      thumb.addEventListener('mouseenter', async () => {
        try{ await vid.play(); }catch(e){}
        if(previewTimeout) clearTimeout(previewTimeout);
        previewTimeout = setTimeout(()=>{ try{ vid.pause(); vid.currentTime = 0; }catch(e){} }, PREVIEW_MS);
      });
      thumb.addEventListener('mouseleave', ()=>{ if(previewTimeout){ clearTimeout(previewTimeout); previewTimeout=null } try{ vid.pause(); vid.currentTime = 0 }catch(e){} });
      thumb.addEventListener('click', () => {
        const card = thumb.closest('.card');
        const titleEl = card && card.querySelector('.meta .title');
        const channelEl = card && card.querySelector('.meta .channel');
        const modal = document.getElementById('shortModal');
        const modalVideo = document.getElementById('modalVideo');
        if(modalVideo){ modalVideo.src = vid.currentSrc || vid.querySelector('source')?.src || vid.getAttribute('poster') || ''; modalVideo.currentTime = 0; modalVideo.play().catch(()=>{}); }
        const modalTitle = document.getElementById('modalTitle');
        const modalChannel = document.getElementById('modalChannel');
        if(modalTitle) modalTitle.textContent = titleEl ? titleEl.textContent : '';
        if(modalChannel) modalChannel.innerHTML = channelEl ? channelEl.innerHTML : '';
        if(modal){ modal.style.display = 'block'; modal.setAttribute('aria-hidden','false'); }
      });
    } else {
      // non-video thumbs: click opens modal with image as source
      thumb.addEventListener('click', () => {
        const img = thumb.querySelector('img');
        const src = img ? img.src : '';
        const modalVideo = document.getElementById('modalVideo');
        if(modalVideo){ modalVideo.src = src; modalVideo.play && modalVideo.play().catch(()=>{}); }
        const card = thumb.closest('.card');
        const titleEl = card && card.querySelector('.meta .title');
        const channelEl = card && card.querySelector('.meta .channel');
        const modalTitle = document.getElementById('modalTitle');
        const modalChannel = document.getElementById('modalChannel');
        if(modalTitle) modalTitle.textContent = titleEl ? titleEl.textContent : '';
        if(modalChannel) modalChannel.innerHTML = channelEl ? channelEl.innerHTML : '';
        const modal = document.getElementById('shortModal');
        if(modal){ modal.style.display = 'block'; modal.setAttribute('aria-hidden','false'); }
      });
    }
  });
}

// run once on load to bind static cards
window.addEventListener('DOMContentLoaded', () => {
  attachThumbHandlers();
});

// modal close handlers and menu toggle
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('shortModal');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalChannel = document.getElementById('modalChannel');
  const modalPlay = document.getElementById('modalPlay');
  const modalMute = document.getElementById('modalMute');
  function closeModal(){
    modalVideo.pause();
    modalVideo.src = '';
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  }
  modalClose && modalClose.addEventListener('click', closeModal);
  modalBackdrop && modalBackdrop.addEventListener('click', closeModal);

  // modal controls
  modalPlay && modalPlay.addEventListener('click', () => {
    if(modalVideo.paused){
      modalVideo.play();
      modalPlay.textContent = '❚❚';
    } else {
      modalVideo.pause();
      modalPlay.textContent = '▶';
    }
  });
  modalMute && modalMute.addEventListener('click', () => {
    modalVideo.muted = !modalVideo.muted;
    modalMute.textContent = modalVideo.muted ? '🔇' : '🔊';
  });

  modalVideo && modalVideo.addEventListener('play', () => { if(modalPlay) modalPlay.textContent = '❚❚'; });
  modalVideo && modalVideo.addEventListener('pause', () => { if(modalPlay) modalPlay.textContent = '▶'; });

  const menuBtn = document.getElementById('menuBtn');
  menuBtn && menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
});
