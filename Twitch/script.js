document.addEventListener('DOMContentLoaded', function () {
  // Sidebar item active toggle
  var menuItems = document.querySelectorAll('.left-sidebar .menu-item');
  menuItems.forEach(function (mi) {
    mi.addEventListener('click', function () {
      menuItems.forEach(function (m) { m.classList.remove('active'); });
      mi.classList.add('active');
    });
  });

  // Simple search: filtra por texto en tarjetas
  var searchBtn = document.getElementById('searchBtn');
  var searchInput = document.getElementById('searchInput');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function () {
      var q = searchInput.value.trim().toLowerCase();
      var cards = document.querySelectorAll('#streams-list .stream-card');
      if (!q) { cards.forEach(function (c) { c.style.display = ''; }); return; }
      cards.forEach(function (c) {
        var text = c.textContent.toLowerCase();
        c.style.display = text.includes(q) ? '' : 'none';
      });
    });
    // also allow enter key
    searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') searchBtn.click(); });
  }
  
  // --- Carousel 3D logic ---
  var carousel = document.getElementById('carousel');
  if (!carousel) return;
  var items = Array.from(document.querySelectorAll('.carousel-item'));
  var n = items.length;
  var center = 0;

  function render() {
    for (var i = 0; i < n; i++) {
      var item = items[i];
      // compute shortest distance (looping)
      var diff = ((i - center) % n + n) % n; // 0..n-1
      if (diff > n/2) diff -= n; // range centered around 0
      // compute spacing dynamically based on item width
      var itemW = item.offsetWidth || 380;
      var spacing = Math.round(itemW * 0.6);
      var tx = diff * spacing; // horizontal spacing
      var tz = -Math.abs(diff) * 100 + (diff === 0 ? 140 : 0);
      var rot = diff * -16;
      var scale = diff === 0 ? 1 : (Math.abs(diff) === 1 ? 0.92 : 0.78);
      var opacity = Math.abs(diff) > 2 ? 0.12 : 1;
      var zIndex = 100 - Math.abs(diff);

      // center base with translateX(-50%) then shift by tx
      item.style.transform = 'translateX(-50%) translateX(' + tx + 'px) translateZ(' + tz + 'px) rotateY(' + rot + 'deg) scale(' + scale + ') translateY(-50%)';
      item.style.zIndex = zIndex;
      item.style.opacity = opacity;

      item.classList.toggle('center', diff === 0);
      item.classList.toggle('inactive', Math.abs(diff) > 2);
    }
  }

  // initial placement: center items absolute positioned by CSS top/left 50%
  items.forEach(function (it) { it.style.top = '50%'; it.style.left = '50%'; it.style.transformOrigin = '50% 50%'; });
  render();

  // Prev/Next handlers
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.addEventListener('click', function () { center = (center - 1 + n) % n; render(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { center = (center + 1) % n; render(); });

  // allow clicking on non-center items to bring them to center
  items.forEach(function (it, idx) {
    it.addEventListener('click', function () { center = idx; render(); });
    var vid = it.querySelector('video');
    if (vid) {
      // autoplay on hover (muted required)
      it.addEventListener('mouseenter', function () { vid.play().catch(function(){}); });
      it.addEventListener('mouseleave', function () { try { vid.pause(); vid.currentTime = 0; } catch(e){} });
    }
  });

  // keyboard navigation
  document.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') nextBtn.click(); if (e.key === 'ArrowLeft') prevBtn.click(); });
});
