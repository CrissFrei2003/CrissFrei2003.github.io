/* Script para detectar las 13 imágenes con cualquier extensión en la carpeta `img`
   y generar dinámicamente la regla @keyframes `bgCycle` que usa esas URLs.
   Desde `index.html` en `slider/`, la carpeta `img` debe estar en `../img`.
*/
(function(){
  const hero = document.querySelector('.hero');
  const outline = document.querySelector('.outline');
  if(!hero || !outline) return;

  // Carpetas candidatas donde pueden estar tus imágenes (desde slider/)
  const candidateFolders = ['../img','../animacion','..','../animacion/img'];
  const total = 13;
  const exts = ['avif','webp','jpg','jpeg','png','gif'];
  const durationSec = 5; // duración total de la animación

  function probe(src){
    return new Promise((resolve)=>{
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function findUrlFor(n){
    for(const folder of candidateFolders){
      for(const ext of exts){
        // construir ruta relativa
        const url = `${folder}/${n}.${ext}`;
        // eslint-disable-next-line no-await-in-loop
        if(await probe(url)) return url;
      }
    }
    return null;
  }

  async function buildLayers(){
    const found = [];
    for(let i=1;i<=total;i++){
      // eslint-disable-next-line no-await-in-loop
      const url = await findUrlFor(i);
      if(url) found.push(url);
    }

    const layersContainer = document.querySelector('.layers');
    if(found.length === 0){
      // fallback: mostrar un solo layer con gradiente
      const l = document.createElement('div');
      l.className = 'layer';
      l.innerHTML = `<span>EL SEÑOR</span><span>DE LOS</span><span>ANILLOS</span>`;
      l.style.background = 'linear-gradient(90deg,#444,#222)';
      l.style.webkitBackgroundClip = 'text';
      l.style.backgroundClip = 'text';
      layersContainer.appendChild(l);
      return;
    }

    const n = found.length;
    const slot = 100 / n;
    const fadePct = Math.max(3, slot * 0.25); // porcentaje de transición

    let styleText = '';
    for(let i=0;i<n;i++){
      const layer = document.createElement('div');
      layer.className = `layer layer-${i}`;
      layer.innerHTML = `<span>EL SEÑOR</span><span>DE LOS</span><span>ANILLOS</span>`;
      layer.style.backgroundImage = `url(${found[i]})`;
      layer.style.backgroundSize = '100% auto';
      layersContainer.appendChild(layer);

      const start = i * slot;
      const end = (i+1) * slot;
      const inStart = Math.max(0, start - fadePct/2);
      const inEnd = Math.min(100, start + fadePct/2);
      const outStart = Math.max(0, end - fadePct/2);
      const outEnd = Math.min(100, end + fadePct/2);

      styleText += `@keyframes fade-${i} {\n`;
      styleText += `  0%{opacity:0}\n`;
      if(inStart>0) styleText += `  ${inStart}%{opacity:0}\n`;
      styleText += `  ${inEnd}%{opacity:1}\n`;
      styleText += `  ${outStart}%{opacity:1}\n`;
      if(outEnd<100) styleText += `  ${outEnd}%{opacity:0}\n`;
      styleText += `  100%{opacity:0}\n}`;

      styleText += `.layer-${i}{animation:fade-${i} ${durationSec}s linear infinite;}`;
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = styleText;
    document.head.appendChild(styleEl);

    // sincronizar estilos y tamaño de las capas con el título outline
    syncLayerStyles();
    // recalcular en resize (debounced)
    let rto = null;
    window.addEventListener('resize', ()=>{
      clearTimeout(rto);
      rto = setTimeout(syncLayerStyles, 120);
    });
  }

  // Copia estilos relevantes de `outline` (tamaño, fuente, espaciado)
  // y ajusta `background-size` de cada layer para que la imagen escale por el ancho
  function syncLayerStyles(){
    const outlineEl = document.querySelector('.outline');
    const layers = document.querySelectorAll('.layer');
    if(!outlineEl || layers.length===0) return;

    const cs = getComputedStyle(outlineEl);
    const fontProps = {
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
    };

    const outlineRect = outlineEl.getBoundingClientRect();
    const targetWidth = Math.round(outlineRect.width);

    layers.forEach(layer=>{
      // aplicar propiedades tipográficas
      layer.style.fontSize = fontProps.fontSize;
      layer.style.lineHeight = fontProps.lineHeight;
      layer.style.fontFamily = fontProps.fontFamily;
      layer.style.fontWeight = fontProps.fontWeight;
      layer.style.letterSpacing = fontProps.letterSpacing;
      layer.style.textTransform = fontProps.textTransform;

      // asegurar que el fondo se escala según el ancho del outline
      layer.style.backgroundSize = `${targetWidth}px auto`;
      layer.style.backgroundPosition = 'center';
      layer.style.backgroundRepeat = 'no-repeat';
    });
  }

  // iniciar detección e inyección de capas y keyframes
  buildLayers();

  // tecla espacio para pausar/reanudar
  document.addEventListener('keydown', (e)=>{
    if(e.code === 'Space'){
      const state = getComputedStyle(title).animationPlayState || 'running';
      title.style.animationPlayState = state === 'paused' ? 'running' : 'paused';
      e.preventDefault();
    }
  });

})();
